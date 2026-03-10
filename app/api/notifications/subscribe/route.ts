import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push"; // <-- 1. Added web-push import

export async function POST(req: Request) {
    try {
        const { subscription, userId } = await req.json();

        if (!subscription || !subscription.endpoint || !userId) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Map web-push keys to schema
        const endpoint = subscription.endpoint;
        const p256dh = subscription.keys.p256dh;
        const auth = subscription.keys.auth;

        // Upsert subscription
        const { error } = await supabase
            .from("push_subscriptions")
            .upsert(
                {
                    user_id: userId,
                    endpoint: endpoint,
                    p256dh: p256dh,
                    auth: auth,
                },
                { onConflict: 'user_id, endpoint' }
            );

        if (error) {
            console.error("====== DATABASE ERROR SAVING SUBSCRIPTION ======");
            console.error(JSON.stringify(error, null, 2));
            console.error("==========================================");
            return NextResponse.json({ error: "Failed to save subscription", details: error }, { status: 500 });
        }

        // ==========================================
        // 🔔 2. INSTANT "WELCOME" NOTIFICATION 🔔
        // ==========================================
        try {
            // Initialize VAPID Keys
            webpush.setVapidDetails(
                process.env.VAPID_SUBJECT || "mailto:admin@puffpay.com",
                process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
                process.env.VAPID_PRIVATE_KEY!
            );

            // Format the message
            const payload = JSON.stringify({
                title: "🔔 Notifications Enabled!",
                body: "You're all set! We'll notify you about new expenses and settlements.",
            });

            // Send it directly to the browser that just subscribed
            await webpush.sendNotification(subscription, payload);

        } catch (pushError) {
            console.error("====== ERROR SENDING WELCOME PUSH ======");
            console.error(pushError);
            console.error("==========================================");
            // Note: We catch the error but don't return a 500 status here, 
            // because the database save was still successful!
        }
        // ==========================================

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("====== CATCH BLOCK ERROR IN SUBSCRIBE ROUTE ======");
        console.error(error?.message || error);
        console.error("================================================");
        return NextResponse.json({ error: "Internal Server Error", details: error?.message || String(error) }, { status: 500 });
    }
}