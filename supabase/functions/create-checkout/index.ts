import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const stripe = new Stripe(stripeSecretKey || "", {
  apiVersion: "2024-06-20",
});

function getCorsHeaders(req: Request) {
  const reqHeaders = req.headers.get("access-control-request-headers");
  const origin = req.headers.get("origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": reqHeaders || "authorization, x-client-info, apikey, content-type, x-frame-options, *",
    "Access-Control-Max-Age": "86400",
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured in Supabase secrets");
    }

    const body = await req.json();
    const { order_id, account_id, session_id, action } = body;

    // Get auth user from request Authorization header
    const authHeader = req.headers.get("Authorization");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      },
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    // If no user authenticated, we can still proceed with verify action
    // by using metadata from the Stripe session, or fall back to creating
    // order with guest IDs. For non-verify actions, require authentication.
    if (userError || !user) {
      if (action !== "verify") {
        throw new Error("Unauthorized: " + (userError?.message || "Invalid session"));
      }
      // For verify action, allow proceeding without authenticated user
      // The order creation will use metadata fallbacks (user.id will be undefined,
      // but we have || user.id fallback in the order insertion)
    }

    // Use service role for database operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ==========================================
    // ACTION: VERIFY SESSION (When buyer returns)
    // ==========================================
    if (action === "verify" && session_id) {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      let targetOrderId = order_id || session.metadata?.order_id;
      const targetAccountId = session.metadata?.account_id;

      if (session.payment_status === "paid") {
        const paidAmount = session.amount_total ? session.amount_total / 100 : 0;
        const storeFee = +(paidAmount * 0.08).toFixed(2);
        const sellerEarnings = +(paidAmount - storeFee).toFixed(2);

        let order = null;

        if (targetOrderId) {
          const { data: existingOrder } = await supabaseAdmin
            .from("orders")
            .select("*")
            .eq("id", targetOrderId)
            .single();
          order = existingOrder;
        }

        if (!order && session.id) {
          const { data: bySession } = await supabaseAdmin
            .from("orders")
            .select("*")
            .eq("stripe_checkout_session_id", session.id)
            .maybeSingle();
          order = bySession;
        }

        // If order doesn't exist yet, create it now that payment is confirmed!
        if (!order) {
          const { data: newOrder, error: createError } = await supabaseAdmin
            .from("orders")
            .insert({
              buyer_id: session.metadata?.buyer_id || (user?.id || "guest"),
              seller_id: session.metadata?.seller_id || (user?.id || "guest"),
              account_id: targetAccountId,
              amount: paidAmount,
              payment_status: "paid",
              status: "in_progress",
              escrow_status: "payment_verified",
              payment_method: "card",
              stripe_checkout_session_id: session.id,
              stripe_payment_intent_id: session.payment_intent,
              amount_paid: paidAmount,
              paid_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (createError) {
            console.error("Error creating order upon verification:", createError);
            throw new Error("Failed to create verified order: " + createError.message);
          }
          order = newOrder;
          targetOrderId = order.id;
        } else if (order.payment_status !== "paid") {
          // Update existing order to paid
          await supabaseAdmin
            .from("orders")
            .update({
              payment_status: "paid",
              status: "in_progress",
              escrow_status: "payment_verified",
              stripe_payment_intent_id: session.payment_intent,
              amount_paid: paidAmount,
              paid_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", order.id);
          targetOrderId = order.id;
        }

        // Mark account as sold
        const accId = order.account_id || targetAccountId;
        if (accId) {
          await supabaseAdmin
            .from("accounts")
            .update({
              status: "sold",
              updated_at: new Date().toISOString(),
            })
            .eq("id", accId);
        }

        // Record transaction with 8% store fee auto-deducted
        const { data: existingTx } = await supabaseAdmin
          .from("transactions")
          .select("id")
          .eq("order_id", order.id)
          .maybeSingle();

        if (!existingTx) {
          await supabaseAdmin.from("transactions").insert({
            seller_id: order.seller_id,
            order_id: order.id,
            amount: sellerEarnings,
            type: "sale",
            status: "completed",
            description: `Order #${order.id} paid via Card (8% fee: $${storeFee} deducted)`,
          });
        }

        // Notify seller
        if (order.seller_id) {
          await supabaseAdmin.from("notifications").insert({
            user_id: order.seller_id,
            type: "order",
            title: "💰 Order Paid via Card!",
            message: `Order #${order.id} was paid successfully. Net earnings: $${sellerEarnings} (8% fee deducted). Please deliver credentials.`,
            link: "/seller-dashboard/orders",
          });
        }

        return new Response(
          JSON.stringify({
            success: true,
            payment_status: "paid",
            order_id: targetOrderId,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          payment_status: session.payment_status,
          order_id: targetOrderId,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // ==========================================
    // ACTION: CREATE CHECKOUT SESSION
    // ==========================================
    let targetAccount = null;
    let orderRecord = null;

    if (account_id) {
      const { data: acc, error: accErr } = await supabaseAdmin
        .from("accounts")
        .select("*")
        .eq("id", account_id)
        .single();

      if (accErr || !acc) {
        throw new Error("Account listing not found: " + (accErr?.message || ""));
      }
      if (acc.status !== "active") {
        throw new Error("This account is no longer active");
      }
      if (acc.seller_id === user.id) {
        throw new Error("You cannot purchase your own account");
      }
      targetAccount = acc;
    } else if (order_id) {
      const { data: ord, error: ordErr } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("id", order_id)
        .eq("buyer_id", user.id)
        .single();

      if (ordErr || !ord) {
        throw new Error("Order not found or unauthorized: " + (ordErr?.message || ""));
      }
      orderRecord = ord;

      const { data: acc, error: accErr } = await supabaseAdmin
        .from("accounts")
        .select("*")
        .eq("id", ord.account_id)
        .single();

      if (accErr || !acc) {
        throw new Error("Account listing not found");
      }
      targetAccount = acc;
    } else {
      throw new Error("Either account_id or order_id is required");
    }

    // Validate price
    const orderAmount = Number(orderRecord?.amount || targetAccount.price);
    if (isNaN(orderAmount) || orderAmount <= 0) {
      throw new Error(`Invalid price amount: ${orderAmount}`);
    }
    const unitAmountCents = Math.round(orderAmount * 100);

    // Resolve images
    let productImages: string[] = [];
    if (Array.isArray(targetAccount.image_urls) && targetAccount.image_urls.length > 0) {
      const firstImg = targetAccount.image_urls[0];
      if (typeof firstImg === "string" && firstImg.startsWith("http")) {
        productImages.push(firstImg);
      }
    }

    // If still empty, check account_images table
    if (productImages.length === 0) {
      const { data: dbImages } = await supabaseAdmin
        .from("account_images")
        .select("url")
        .eq("account_id", targetAccount.id)
        .order("sort_order", { ascending: true })
        .limit(1);
      if (dbImages && dbImages[0]?.url) {
        productImages.push(dbImages[0].url);
      }
    }

    // Resolve frontend URL dynamically
    const requestOrigin = req.headers.get("origin") || req.headers.get("referer");
    let baseUrl = Deno.env.get("FRONTEND_URL") || "https://www.zazastore.games";
    if (requestOrigin) {
      try {
        const parsed = new URL(requestOrigin);
        baseUrl = parsed.origin;
      } catch {
        // fallback
      }
    }
    baseUrl = baseUrl.replace(/\/$/, "");

    const successRedirectUrl = orderRecord
      ? `${baseUrl}/order-confirmation/${orderRecord.id}?session_id={CHECKOUT_SESSION_ID}`
      : `${baseUrl}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: targetAccount.title || `Game Account #${targetAccount.id}`,
              description: (targetAccount.description || `Purchase for account #${targetAccount.id}`).slice(0, 500),
              images: productImages.slice(0, 1),
            },
            unit_amount: unitAmountCents,
          },
          quantity: 1,
        },
      ],
      success_url: successRedirectUrl,
      cancel_url: `${baseUrl}/checkout?cancelled=true`,
      customer_email: user.email,
      metadata: {
        order_id: orderRecord?.id || "",
        buyer_id: user.id,
        seller_id: targetAccount.seller_id,
        account_id: targetAccount.id,
      },
      payment_intent_data: {
        metadata: {
          order_id: orderRecord?.id || "",
          buyer_id: user.id,
          seller_id: targetAccount.seller_id,
          account_id: targetAccount.id,
        },
      },
    });

    // If order already exists, update with session ID
    if (orderRecord) {
      await supabaseAdmin
        .from("orders")
        .update({
          stripe_checkout_session_id: session.id,
          payment_status: "processing",
          payment_method: "card",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderRecord.id);
    }

    return new Response(
      JSON.stringify({
        session_id: session.id,
        checkout_url: session.url,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in create-checkout:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
