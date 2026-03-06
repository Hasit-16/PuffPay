"use client";

import { ActivityItem, deleteTransaction, updateTransaction } from "@/app/activity/actions";
import { approveSettlement, rejectSettlement } from "@/app/settle/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowUpRight, ArrowDownLeft, MoreVertical, Pencil, Trash } from "lucide-react";
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
            router.refresh(); // creating a new change
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
            router.refresh(); // creating a new change
        } catch (error) {
            toast.error("Failed to delete transaction");
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirm = async (id: string) => {
        setIsLoading(true);
        try {
            await approveSettlement(id);
            toast.success("Payment confirmed!");
            router.refresh();
        } catch (error) {
            toast.error("Failed to confirm payment");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async (id: string) => {
        setIsLoading(true);
        try {
            await rejectSettlement(id);
            toast.success("Payment rejected");
            router.refresh();
        } catch (error) {
            toast.error("Failed to reject payment");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="relative mb-3 overflow-hidden bg-[#0a0a0c] backdrop-blur-md border border-white/10 rounded-2xl p-4 w-full">
                {/* Dynamic Underglow */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[50%] blur-[30px] rounded-full pointer-events-none z-0 ${item.type === 'paid' ? 'bg-red-500/10' : 'bg-green-500/10'}`}></div>

                <div className="relative z-10 flex items-center justify-between w-full">
                    {/* Left Side: Avatar + Info */}
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={item.otherPerson.avatar_url || ""} />
                                <AvatarFallback className="bg-white/5 text-zinc-300">{item.otherPerson.username?.charAt(0).toUpperCase()}</AvatarFallback>
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
                            <p className="font-medium text-zinc-50 text-sm line-clamp-1">{item.description}</p>
                            <p className="text-xs text-zinc-400">
                                {item.type === 'paid' ? `You paid for ${item.otherPerson.username}` : `${item.otherPerson.username} paid for you`}
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Amount + Menu */}
                    <div className="flex items-center gap-2">
                        <div className="flex flex-col items-end">
                            <div className={`font-bold text-sm tabular-nums whitespace-nowrap ${item.type === 'paid' ? 'text-red-500' : 'text-green-600'}`}>
                                {item.type === 'paid' ? '-' : '+'} ₹{item.amount.toLocaleString()}
                            </div>
                            {item.type === 'paid' && item.status === 'confirming' && (
                                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                                    Confirming
                                </span>
                            )}
                            {item.type === 'borrowed' && item.status === 'confirming' && (
                                <div className="flex gap-1 mt-1">
                                    <Button size="sm" className="h-6 text-[10px] px-2 bg-green-600 hover:bg-green-700 active:scale-95 transition-all duration-200"
                                        onClick={() => handleConfirm(item.id)}
                                    >
                                        Confirm
                                    </Button>
                                    <Button size="sm" variant="destructive" className="h-6 text-[10px] px-2 active:scale-95 transition-all duration-200"
                                        onClick={() => handleReject(item.id)}
                                    >
                                        Reject
                                    </Button>
                                </div>
                            )}
                        </div>

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
                        <Button type="submit" onClick={handleUpdate} disabled={isLoading} className="active:scale-95 transition-all duration-200">
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
