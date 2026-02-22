import Image from "next/image";
import Link from "next/link";

export default function TopBar() {
    return (
        <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-4 h-14">
                <Link href="/dashboard" className="flex items-center">
                    <Image src="/logo-transparent.png" width={110} height={36} alt="PuffPay Logo" className="object-contain" />
                </Link>
            </div>
        </header>
    );
}
