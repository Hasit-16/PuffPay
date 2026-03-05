import { NextResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

// Initialize VAPID
webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@puffpay.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
    try {
        const { targetUserId, title, body, data } = await req.json();

        if (!targetUserId || !title) {
            return NextResponse.json({ error: "Missing target userId or title" }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Fetch user subscriptions
        const { data: subscriptions, error } = await supabase
            .from("push_subscriptions")
            .select("*")
            .eq("user_id", targetUserId);

        if (error) {
            console.error("DB Error fetching subscriptions:", error);
            return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
        }

        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({ success: true, message: "User has no active subscriptions." });
        }

        const payload = JSON.stringify({
            title,
            body,
            data: data || {},
        });

        // Send push to all active user devices
        const pushPromises = subscriptions.map(async (sub) => {
            try {
                const pushSubscription = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth,
                    },
                };
                await webpush.sendNotification(pushSubscription, payload);
            } catch (err: any) {
                if (err.statusCode === 404 || err.statusCode === 410) {
                    // Subscription has expired or is no longer valid, clean it up
                    await supabase.from("push_subscriptions").delete().eq("id", sub.id);
                } else {
                    console.error("Error sending push to subscription:", err);
                }
            }
        });

        await Promise.allSettled(pushPromises);

        return NextResponse.json({ success: true, count: subscriptions.length });
    } catch (error: any) {
        console.error("Error in POST /api/notifications/send:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
