import Image from "next/image";
import Link from "next/link";

export default function TopBar() {
    return (
        <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-4 h-14">
                <Link href="/dashboard" className="flex items-center">
                    <Image src="/icons/android-chrome-192x192.png" width={32} height={32} alt="PuffPay Logo" />
                </Link>
            </div>
        </header>
    );
}
