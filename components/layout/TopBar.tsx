import Image from "next/image";
import Link from "next/link";

export default function TopBar() {
    return (
        <header className="sticky top-0 z-40 w-full bg-white/5 backdrop-blur-md [mask-image:linear-gradient(to_bottom,black_50%,transparent)] pt-[max(env(safe-area-inset-top),1.5rem)] pb-2 px-4 flex items-center justify-between transition-all">
            <Link href="/dashboard" className="flex items-center active:scale-95 transition-all duration-200">
                <img src="/logo-transparent-white.png" alt="PuffPay Logo" className="h-10 w-auto object-contain" />
            </Link>
        </header>
    );
}
