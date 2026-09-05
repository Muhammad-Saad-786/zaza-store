import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const stripe = new Stripe(stripeSecretKey || "", {
  apiVersion: "2024-06-20",
});

function getCorsHeaders(req: Request) {
  const reqHeaders = req.headers.get("access-control-request-headers");
  const origin = req.headers.get("origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": reqHeaders || "authorization, x-client-info, apikey, content-type, stripe-signature, *",
    "Access-Control-Max-Age": "86400",
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    if (!stripeWebhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
    }

    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      stripeWebhookSecret,
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    console.log(`Processing Stripe event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("Checkout completed. Session ID:", session.id);
        console.log("Metadata:", JSON.stringify(session.metadata));

        const orderId = session.metadata?.order_id || "";
        const accountId = session.metadata?.account_id;
        const buyerId = session.metadata?.buyer_id;
        const sellerId = session.metadata?.seller_id;

        const paidAmount = session.amount_total ? session.amount_total / 100 : 0;
        const fee = +(paidAmount * 0.08).toFixed(2);
        const sellerEarnings = +(paidAmount - fee).toFixed(2);

        let order = null;
        let resolvedOrderId = orderId;

        // Try to find existing order
        if (orderId) {
          const { data: ord } = await supabaseAdmin
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .maybeSingle();
          order = ord;
        }

        // If not found by order_id, try by session ID
        if (!order && session.id) {
          const { data: ordBySession } = await supabaseAdmin
            .from("orders")
            .select("*")
            .eq("stripe_checkout_session_id", session.id)
            .maybeSingle();
          order = ordBySession;
          if (order) resolvedOrderId = order.id;
        }

        // If order doesn't exist, create it
        if (!order) {
          console.log("Order not found. Creating new order...");

          const { data: newOrder, error: createError } = await supabaseAdmin
            .from("orders")
            .insert({
              buyer_id: buyerId,
              seller_id: sellerId,
              account_id: accountId,
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
            console.error("Error creating order:", createError);
            throw new Error(`Failed to create order: ${createError.message}`);
          }

          order = newOrder;
          resolvedOrderId = newOrder.id;
          console.log("Order created:", newOrder.id);
        } else {
          // Update existing order
          console.log("Updating existing order:", resolvedOrderId);

          const { error: updateError } = await supabaseAdmin
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
            .eq("id", resolvedOrderId);

          if (updateError) {
            console.error("Error updating order:", updateError);
          }
        }

        // Mark account as sold
        if (order.account_id || accountId) {
          const targetAccountId = order.account_id || accountId;
          const { error: accountError } = await supabaseAdmin
            .from("accounts")
            .update({
              status: "sold",
              updated_at: new Date().toISOString(),
            })
            .eq("id", targetAccountId);

          if (accountError) {
            console.error("Error updating account:", accountError);
          }
        }

        // Create transaction
        const { data: existingTx } = await supabaseAdmin
          .from("transactions")
          .select("id")
          .eq("order_id", resolvedOrderId)
          .maybeSingle();

        if (!existingTx) {
          const { error: txError } = await supabaseAdmin
            .from("transactions")
            .insert({
              seller_id: order.seller_id || sellerId,
              order_id: resolvedOrderId,
              amount: sellerEarnings,
              type: "sale",
              status: "completed",
              description: `Order #${resolvedOrderId} payment verified (8% store fee: $${fee} deducted)`,
            });

          if (txError) {
            console.error("Error creating transaction:", txError);
          }
        }

        // Notify seller
        const notifySellerId = order.seller_id || sellerId;
        if (notifySellerId) {
          await supabaseAdmin.from("notifications").insert({
            user_id: notifySellerId,
            type: "order",
            title: "💰 Order Paid via Stripe!",
            message: `Order #${resolvedOrderId} was paid ($${paidAmount}). Net earnings: $${sellerEarnings} (8% fee deducted). Please deliver credentials.`,
            link: "/seller-dashboard/orders",
          });
        }

        // Notify buyer
        const notifyBuyerId = order.buyer_id || buyerId;
        if (notifyBuyerId) {
          await supabaseAdmin.from("notifications").insert({
            user_id: notifyBuyerId,
            type: "order",
            title: "🎉 Payment Confirmed!",
            message: `Your payment of $${paidAmount} for Order #${resolvedOrderId} was successful. The seller has been notified to deliver your account.`,
            link: `/order-confirmation/${resolvedOrderId}`,
          });
        }

        console.log("Order processing complete:", resolvedOrderId);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.order_id;
        console.log(`Payment intent succeeded. Order: ${orderId}`);

        if (orderId) {
          const paidAmount = paymentIntent.amount ? paymentIntent.amount / 100 : 0;
          const { error } = await supabaseAdmin
            .from("orders")
            .update({
              payment_status: "paid",
              stripe_payment_intent_id: paymentIntent.id,
              amount_paid: paidAmount,
              paid_at: new Date().toISOString(),
              status: "in_progress",
              escrow_status: "payment_verified",
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId)
            .neq("payment_status", "paid");

          if (error) {
            console.error("Error updating order from payment_intent:", error);
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.order_id;
        console.log(`Payment failed. Order: ${orderId}`);

        if (orderId) {
          const { error } = await supabaseAdmin
            .from("orders")
            .update({
              payment_status: "failed",
              notes: paymentIntent.last_payment_error?.message || "Payment failed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId);

          if (error) {
            console.error("Error updating failed order:", error);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});