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

  // Handle CORS preflight
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

    // Verify webhook signature
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      stripeWebhookSecret,
    );

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    console.log(`Processing Stripe event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        let orderId = session.metadata?.order_id;
        const accountId = session.metadata?.account_id;
        const buyerId = session.metadata?.buyer_id;
        const sellerId = session.metadata?.seller_id;
        console.log(`Checkout completed. Order: ${orderId}, Account: ${accountId}, Session: ${session.id}`);

        const paidAmount = session.amount_total ? session.amount_total / 100 : 0;
        const fee = +(paidAmount * 0.08).toFixed(2); // 8% Store Fee
        const sellerEarnings = +(paidAmount - fee).toFixed(2);

        let order = null;

        if (orderId) {
          const { data: ord } = await supabaseAdmin
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .maybeSingle();
          order = ord;
        }

        if (!order && session.id) {
          const { data: ordBySession } = await supabaseAdmin
            .from("orders")
            .select("*")
            .eq("stripe_checkout_session_id", session.id)
            .maybeSingle();
          order = ordBySession;
        }

        // If order doesn't exist yet, create it now that payment is confirmed!
        if (!order) {
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
            console.error("Webhook error creating order:", createError);
            break;
          }
          order = newOrder;
          orderId = order.id;
        } else {
          orderId = order.id;
          // Update existing order status to paid and in_progress
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
            .eq("id", orderId);
        }

        // Mark account as sold
        const targetAccId = order.account_id || accountId;
        if (targetAccId) {
          await supabaseAdmin
            .from("accounts")
            .update({
              status: "sold",
              updated_at: new Date().toISOString(),
            })
            .eq("id", targetAccId);
        }

        // Auto-manage Transactions (8% Store fee auto-deducted)
        const { data: existingTx } = await supabaseAdmin
          .from("transactions")
          .select("id")
          .eq("order_id", orderId)
          .maybeSingle();

        if (!existingTx) {
          await supabaseAdmin.from("transactions").insert({
            seller_id: order.seller_id || sellerId,
            order_id: orderId,
            amount: sellerEarnings,
            type: "sale",
            status: "completed",
            description: `Order #${orderId} payment verified (8% store fee: $${fee} deducted)`,
          });
          console.log(`Transaction recorded for seller: $${sellerEarnings}`);
        }

        // Notify Seller
        const notifySellerId = order.seller_id || sellerId;
        if (notifySellerId) {
          await supabaseAdmin.from("notifications").insert({
            user_id: notifySellerId,
            type: "order",
            title: "💰 Order Paid via Stripe!",
            message: `Order #${orderId} was paid ($${paidAmount}). Net earnings: $${sellerEarnings} (8% fee deducted). Please deliver credentials.`,
            link: "/seller-dashboard/orders",
          });
        }

        // Notify Buyer
        const notifyBuyerId = order.buyer_id || buyerId;
        if (notifyBuyerId) {
          await supabaseAdmin.from("notifications").insert({
            user_id: notifyBuyerId,
            type: "order",
            title: "🎉 Payment Confirmed!",
            message: `Your payment of $${paidAmount} for Order #${orderId} was successful. The seller has been notified to deliver your account.`,
            link: `/order-confirmation/${orderId}`,
          });
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.order_id;
        console.log(`Payment succeeded: ${paymentIntent.id}, order: ${orderId}`);

        if (orderId) {
          const paidAmount = paymentIntent.amount ? paymentIntent.amount / 100 : 0;
          await supabaseAdmin
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
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.order_id;
        console.log(`Payment failed: ${paymentIntent.id}, order: ${orderId}`);

        if (orderId) {
          await supabaseAdmin
            .from("orders")
            .update({
              payment_status: "failed",
              notes: paymentIntent.last_payment_error?.message || "Payment failed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId);
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
