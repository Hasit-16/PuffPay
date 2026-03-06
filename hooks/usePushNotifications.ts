import { useState, useEffect } from "react";
import { toast } from "sonner";

export function usePushNotifications() {
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if ("serviceWorker" in navigator && "PushManager" in window) {
            setIsSupported(true);
            registerServiceWorker();
        } else {
            setIsLoading(false);
        }
    }, []);

    const registerServiceWorker = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.getSubscription();
            setSubscription(sub);
        } catch (error) {
            console.error("Service worker registration error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const subscribeToPush = async (userId: string) => {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
            toast.error("Push notifications are not supported in this browser.");
            return false;
        }

        setIsLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;

            // Helper function to convert base64 to Uint8Array safely
            const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
            const padding = "=".repeat((4 - (publicVapidKey.length % 4)) % 4);
            const base64 = (publicVapidKey + padding).replace(/-/g, "+").replace(/_/g, "/");
            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);
            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
            }

            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: outputArray,
            });

            setSubscription(sub);

            // Save to database
            const response = await fetch("/api/notifications/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subscription: sub, userId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to save push subscription to server.");
            }

            toast.success("Push notifications enabled!");
            return true;
        } catch (error) {
            console.error("Error subscribing to push:", error);
            if (Notification.permission === 'denied') {
                toast.error("Notification permission denied. Please enable in site settings.");
            } else if (error instanceof Error) {
                toast.error(error.message || "Failed to enable push notifications.");
            } else {
                toast.error("Failed to enable push notifications.");
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const unsubscribeFromPush = async () => {
        setIsLoading(true);
        try {
            if (subscription) {
                await subscription.unsubscribe();
                setSubscription(null);

                // Remove from database
                // (Optional: Implement DELETE route, keeping scope tight for now)

                toast.success("Push notifications disabled.");
            }
        } catch (error) {
            console.error("Error unsubscribing:", error);
            toast.error("Failed to disable push notifications.");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isSupported,
        subscription,
        subscribeToPush,
        unsubscribeFromPush,
        isLoading,
    };
}
