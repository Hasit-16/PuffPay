
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface FriendRowProps {
    id: string;
    name: string;
    avatar?: string;
    amount: number; // positive = they owe you, negative = you owe them
}

export default function FriendRow({ id, name, avatar, amount }: FriendRowProps) {
    const isOwed = amount > 0;
    const isDebt = amount < 0;
    const isSettled = amount === 0;

    return (
        <Link href={`/settle/${id}`}>
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors active:scale-[0.98]">
                <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border border-slate-100 dark:border-slate-800">
                        <AvatarImage src={avatar} alt={name} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold">
                            {name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>

                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white leading-tight">
                            {name}
                        </h3>
                        {isSettled ? (
                            <p className="text-xs text-slate-400 mt-0.5">All settled up</p>
                        ) : (
                            <p className={`text-xs font-medium mt-0.5 ${isOwed ? 'text-green-600' : 'text-red-500'}`}>
                                {isOwed ? 'Owes you' : 'You owe'}
                            </p>
                        )}
                    </div>
                </div>

                <div className="text-right">
                    {isSettled ? (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-normal">Settled</Badge>
                    ) : (
                        <span className={`text-lg font-bold tabular-nums ${isOwed ? 'text-green-600' : 'text-red-500'}`}>
                            {isOwed ? '+' : '-'}₹{Math.abs(amount)}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
