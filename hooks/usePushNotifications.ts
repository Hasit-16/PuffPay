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
            let registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                console.log("No automatic SW found. Registering manually...");
                registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
            }

            // Prevent hanging if SW fails to initialize by racing with a timeout
            const readyRegistration = await Promise.race([
                navigator.serviceWorker.ready,
                new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000))
            ]);

            if (readyRegistration) {
                const sub = await readyRegistration.pushManager.getSubscription();
                setSubscription(sub);
            } else {
                console.warn("Service worker not ready after 3 seconds.");
            }
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
            // Explicitly request permission first per PWA best practices
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                throw new Error("Notification permission denied. Please enable in site settings.");
            }

            // Aggressively clear out the old corrupted Service Worker from next-pwa
            let registration: ServiceWorkerRegistration | undefined | null = await navigator.serviceWorker.getRegistration();
            if (registration) {
                console.log("Found existing Service Worker. Unregistering to clear corrupted state...");
                await registration.unregister();
            }

            console.log("Registering fresh SW manually for push subscription...");
            registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

            // Force the new worker to update and activate immediately
            await registration.update();

            if (!registration) {
                registration = await Promise.race([
                    navigator.serviceWorker.ready,
                    new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000))
                ]) as ServiceWorkerRegistration | null;

                if (!registration) {
                    throw new Error("Service worker not registered. Please reload the page.");
                }
            }

            // Helper function to convert base64 to Uint8Array safely
            const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() || "";

            if (!publicVapidKey) {
                console.error("VAPID Public Key is missing from environment variables.");
                throw new Error("Push notifications are not configured correctly (missing VAPID key).");
            }

            console.log("VAPID Key Length:", publicVapidKey.length);
            // Log first 10 chars to verify it's loaded without exposing the whole thing
            console.log("VAPID Key Start:", publicVapidKey.substring(0, 10));

            const padding = "=".repeat((4 - (publicVapidKey.length % 4)) % 4);
            const base64 = (publicVapidKey + padding).replace(/-/g, "+").replace(/_/g, "/");
            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);
            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
            }

            console.log("Starting pushManager.subscribe...");
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: outputArray,
            });
            console.log("pushManager.subscribe success!");

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
