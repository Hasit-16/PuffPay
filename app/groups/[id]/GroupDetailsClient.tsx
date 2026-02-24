"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Edit2, Trash2, UserPlus, Users, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateGroupName, deleteGroup, removeGroupMember, addGroupMember } from "@/app/groups/actions";
import Link from "next/link";


type Group = {
    id: string;
    name: string;
    created_by: string;
};

type Profile = {
    id: string;
    username: string | null;
    avatar_url: string | null;
};

interface GroupDetailsClientProps {
    group: Group;
    members: Profile[];
    currentUserId: string;
    availableFriends: Profile[];
}

export default function GroupDetailsClient({ group, members, currentUserId, availableFriends }: GroupDetailsClientProps) {
    const router = useRouter();
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(group.name);
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [selectedFriendId, setSelectedFriendId] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const isCreator = group.created_by === currentUserId;

    // Filter friends who are NOT already in the group
    const friendsToAdd = availableFriends.filter(
        friend => !members.some(member => member.id === friend.id)
    );

    const handleUpdateName = async () => {
        console.log("Updating name to:", newName);
        if (!newName.trim()) return;
        setLoading(true);
        const result = await updateGroupName(group.id, newName);
        console.log("Update result:", result);
        setLoading(false);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Group name updated");
            setIsEditingName(false);
            router.refresh();
        }
    };

    const handleDeleteGroup = async () => {
        setLoading(true);
        const result = await deleteGroup(group.id);
        if (result.error) {
            setLoading(false);
            toast.error(result.error);
        } else {
            toast.success("Group deleted");
            router.push("/friends?tab=groups");
        }
    };

    const handleAddMember = async () => {
        if (!selectedFriendId) return;
        setLoading(true);
        const result = await addGroupMember(group.id, selectedFriendId);
        setLoading(false);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Member added");
            setIsAddingMember(false);
            setSelectedFriendId("");
            router.refresh();
        }
    };

    const handleRemoveMember = async (userId: string) => {
        // Optimistic update? Or just wait for refresh.
        // Confirm?
        if (!confirm("Remove this member?")) return;

        const result = await removeGroupMember(group.id, userId);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Member removed");
            router.refresh();
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Name Edit */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col items-center text-center mt-6">
                <div className="h-16 w-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-zinc-400" />
                </div>
                <h1 className="text-2xl font-bold text-zinc-50 flex items-center justify-center">
                    {group.name}
                    {isCreator && (
                        <button
                            type="button"
                            className="text-zinc-400 hover:text-zinc-50 transition-colors ml-2 cursor-pointer focus:outline-none"
                            onClick={() => setIsEditingName(true)}
                        >
                            <Edit2 className="h-4 w-4" />
                        </button>
                    )}
                </h1>
                <p className="text-sm text-zinc-400 mt-1">{members.length} members</p>
            </div>

            {/* Members List */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl mt-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-zinc-50">Members</h2>
                    {isCreator && (
                        <button
                            onClick={() => setIsAddingMember(true)}
                            className="bg-white/5 border border-white/10 text-zinc-50 hover:bg-white/10 rounded-xl px-4 py-2 text-sm font-medium transition-all"
                        >
                            <div className="flex items-center">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add Member
                            </div>
                        </button>
                    )}
                </div>
                <div className="space-y-3">
                    {members.map(member => (
                        <div key={member.id} className="bg-black/20 border border-white/10 rounded-2xl p-4 flex justify-between items-center transition-all hover:bg-white/5">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={member.avatar_url || ""} />
                                    <AvatarFallback>{member.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-zinc-50">
                                        {member.username}
                                        {member.id === group.created_by && (
                                            <span className="bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-2 py-0.5 text-xs font-semibold ml-2 inline-block -translate-y-[1px]">Admin</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            {isCreator && member.id !== currentUserId && (
                                <button
                                    className="text-red-500/70 hover:text-red-400 transition-colors cursor-pointer focus:outline-none p-2"
                                    onClick={() => handleRemoveMember(member.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Danger Zone */}
            {isCreator && (
                <div className="mt-8">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <button className="w-full bg-red-500 text-zinc-950 font-bold text-lg rounded-xl py-4 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:bg-red-400 transition-all">Delete Group</button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the group "{group.name}" and remove all member associations.
                                    <br /><br />
                                    <strong>Note:</strong> Past expenses split with this group will remain intact in your transaction history.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteGroup} className="bg-red-600 hover:bg-red-700">
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Group"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}

            {/* Edit Name Dialog */}
            <Dialog open={isEditingName} onOpenChange={setIsEditingName}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Group</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="name">Group Name</Label>
                        <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} className="mt-2" />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditingName(false)}>Cancel</Button>
                        <Button onClick={handleUpdateName} disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Member Dialog */}
            <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Member</DialogTitle>
                        <DialogDescription>Add a friend to this group.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {friendsToAdd.length === 0 ? (
                            <p className="text-center text-slate-500">No friends available to add.</p>
                        ) : (
                            <Select value={selectedFriendId} onValueChange={setSelectedFriendId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a friend" />
                                </SelectTrigger>
                                <SelectContent>
                                    {friendsToAdd.map(friend => (
                                        <SelectItem key={friend.id} value={friend.id}>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={friend.avatar_url || ""} />
                                                    <AvatarFallback>{friend.username?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                {friend.username}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddingMember(false)}>Cancel</Button>
                        <Button onClick={handleAddMember} disabled={loading || !selectedFriendId}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Add Member"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
