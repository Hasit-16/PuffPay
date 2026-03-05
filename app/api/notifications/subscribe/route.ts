import { NextResponse } from "next";
import { createClient } from "@supabase/supabase-js";

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
            console.error("DB Error saving subscription:", error);
            return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error in POST /api/notifications/subscribe:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
