import Image from "next/image";
import Link from "next/link";

export default function TopBar() {
    return (
        <header className="sticky top-0 z-40 w-full bg-transparent pt-4 pb-2 px-4">
            <div className="flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center">
                    <Image src="/logo-transparent.png" width={110} height={36} alt="PuffPay Logo" className="object-contain" />
                </Link>
            </div>
        </header>
    );
}
