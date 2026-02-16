"use client";

import { ActivityItem, deleteTransaction, updateTransaction } from "@/app/activity/actions";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowUpRight, ArrowDownLeft, MoreVertical, Pencil, Trash, Bell } from "lucide-react";
import TrafficLightBadge from "@/components/dashboard/TrafficLightBadge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ActivityItemRow({ item }: { item: ActivityItem }) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editAmount, setEditAmount] = useState(item.amount);
    const [editDesc, setEditDesc] = useState(item.description);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            await updateTransaction(item.id, editAmount, editDesc);
            toast.success("Transaction updated");
            setIsEditOpen(false);
            router.refresh();
        } catch (error) {
            toast.error("Failed to update transaction");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await deleteTransaction(item.id);
            toast.success("Transaction deleted");
            setIsDeleteOpen(false);
            router.refresh();
        } catch (error) {
            toast.error("Failed to delete transaction");
        } finally {
            setIsLoading(false);
        }
    };

    const isPayer = item.type === 'paid'; // "I paid" -> I am the Lender (Payer)
    const isBorrower = item.type === 'borrowed'; // "I borrowed" -> I am the Borrower

    const handleNudge = (e: React.MouseEvent) => {
        e.preventDefault();

        let text = "";
        if (isBorrower && item.status === 'confirming') {
            text = encodeURIComponent(`Hey! I sent you ₹${item.amount}. Please confirm it on PuffPay so my balance clears!`);
        } else if (isPayer && item.status === 'pending') {
            text = encodeURIComponent(`Hey! Just a quick reminder about the ₹${item.amount} on PuffPay.`);
        }

        if (text) {
            window.open(`https://wa.me/?text=${text}`, '_blank');
        }
    };

    return (
        <>
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                {/* Left Side: Avatar + Info */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar className="h-10 w-10 border border-slate-100 dark:border-slate-800">
                            <AvatarImage src={item.otherPerson.avatar_url || ""} />
                            <AvatarFallback>{item.otherPerson.username?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white dark:border-slate-900 ${item.type === 'paid' ? 'bg-red-500' : 'bg-green-500'}`}>
                            {item.type === 'paid' ? (
                                <ArrowUpRight className="h-2 w-2 text-white" />
                            ) : (
                                <ArrowDownLeft className="h-2 w-2 text-white" />
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900 dark:text-white text-sm line-clamp-1">{item.description}</p>
                            {/* Traffic Light Badge */}
                            <TrafficLightBadge
                                status={item.status as any}
                                perspective={isPayer ? 'lender' : 'borrower'}
                            />
                        </div>

                        <p className="text-xs text-slate-500">
                            {item.type === 'paid' ? `You paid ${item.otherPerson.username}` : `${item.otherPerson.username} paid you`}
                        </p>
                    </div>
                </div>

                {/* Right Side: Amount + Menu */}
                <div className="flex items-center gap-2">
                    <div className="flex flex-col items-end">
                        <span className={`font-bold text-sm tabular-nums whitespace-nowrap ${item.type === 'paid' ? 'text-red-500' : 'text-green-600'}`}>
                            {item.type === 'paid' ? '-' : '+'} ₹{item.amount.toLocaleString()}
                        </span>
                    </div>

                    {/* Action Buttons */}
                    {isBorrower && item.status === 'pending' && (
                        <Link href={`/settle/${item.id}`} className="mr-1">
                            <Button size="sm" variant="outline" className="h-7 text-xs border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800">
                                Pay
                            </Button>
                        </Link>
                    )}

                    {isPayer && item.status === 'pending' && (
                        <button onClick={handleNudge} className="p-1.5 text-slate-400 hover:text-green-600 transition-colors" title="Send Reminder">
                            <Bell className="w-4 h-4" />
                        </button>
                    )}

                    {isBorrower && item.status === 'confirming' && (
                        <button onClick={handleNudge} className="p-1.5 text-amber-500 hover:text-amber-600 transition-colors" title="Nudge to Confirm">
                            <Bell className="w-4 h-4" />
                        </button>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4 text-slate-400" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsDeleteOpen(true)} className="text-red-600 focus:text-red-600">
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Transaction</DialogTitle>
                        <DialogDescription>
                            Make changes to this transaction here. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                Amount
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                value={editAmount}
                                onChange={(e) => setEditAmount(Number(e.target.value))}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Input
                                id="description"
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={handleUpdate} disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this transaction records.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            {isLoading ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
