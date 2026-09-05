import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { order_id } = await req.json();

        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_ANON_KEY")!,
            {
                global: {
                    headers: { Authorization: req.headers.get("Authorization")! },
                },
            }
        );

        const {
            data: { user },
            error: userError,
        } = await supabaseClient.auth.getUser();

        if (userError || !user) {
            throw new Error("Unauthorized");
        }

        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        // Get order
        const { data: order, error: orderError } = await supabaseAdmin
            .from("orders")
            .select("*")
            .eq("id", order_id)
            .eq("buyer_id", user.id)
            .single();

        if (orderError || !order) {
            throw new Error("Order not found or unauthorized");
        }

        if (order.payment_status !== "paid") {
            throw new Error("Order is not paid yet");
        }

        if (order.buyer_confirmed_at) {
            throw new Error("Order already confirmed");
        }

        // Calculate amounts
        const totalAmount = Number(order.amount);
        const platformFee = +(totalAmount * 0.08).toFixed(2);
        const sellerEarnings = +(totalAmount - platformFee).toFixed(2);

        // Update order status
        await supabaseAdmin
            .from("orders")
            .update({
                status: "completed",
                escrow_status: "released",
                release_status: "released",
                buyer_confirmed_at: new Date().toISOString(),
                payment_released_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq("id", order_id);

        // Update seller wallet
        const { data: existingWallet } = await supabaseAdmin
            .from("seller_wallets")
            .select("*")
            .eq("seller_id", order.seller_id)
            .single();

        if (existingWallet) {
            await supabaseAdmin
                .from("seller_wallets")
                .update({
                    available_balance: existingWallet.available_balance + sellerEarnings,
                    total_earned: existingWallet.total_earned + sellerEarnings,
                    updated_at: new Date().toISOString(),
                })
                .eq("seller_id", order.seller_id);
        } else {
            await supabaseAdmin
                .from("seller_wallets")
                .insert({
                    seller_id: order.seller_id,
                    available_balance: sellerEarnings,
                    total_earned: sellerEarnings,
                    updated_at: new Date().toISOString(),
                });
        }

        // Create transaction record
        await supabaseAdmin
            .from("transactions")
            .insert({
                seller_id: order.seller_id,
                order_id: order_id,
                amount: sellerEarnings,
                type: "sale",
                status: "completed",
                description: `Order #${order_id.slice(0, 8)} completed. 8% fee: $${platformFee}`,
            });

        // Notify seller
        await supabaseAdmin
            .from("notifications")
            .insert({
                user_id: order.seller_id,
                type: "order",
                title: "💰 Payment Released!",
                message: `Buyer confirmed receipt. $${sellerEarnings} added to your wallet (8% fee deducted).`,
                link: "/seller-dashboard/revenue",
            });

        // Notify buyer
        await supabaseAdmin
            .from("notifications")
            .insert({
                user_id: order.buyer_id,
                type: "order",
                title: "✅ Order Completed!",
                message: `You confirmed receipt. Order #${order_id.slice(0, 8)} is now complete.`,
                link: "/dashboard/orders",
            });

        return new Response(
            JSON.stringify({
                success: true,
                message: "Payment released to seller",
                seller_earnings: sellerEarnings,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});