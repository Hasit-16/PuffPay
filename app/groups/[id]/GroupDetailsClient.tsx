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
import { Checkbox } from "@/components/ui/checkbox";

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
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <Users className="h-7 w-7 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                {group.name}
                                {isCreator && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-slate-400 hover:text-slate-600"
                                        onClick={() => {
                                            console.log("Edit button clicked");
                                            setIsEditingName(true);
                                        }}
                                    >
                                        <Edit2 className="h-3 w-3" />
                                    </Button>
                                )}
                            </h1>
                            <p className="text-sm text-slate-500">{members.length} members</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Members List */}
            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Members</CardTitle>
                    {isCreator && (
                        <Button size="sm" variant="outline" onClick={() => setIsAddingMember(true)}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add Member
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    {members.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={member.avatar_url || ""} />
                                    <AvatarFallback>{member.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{member.username}</p>
                                    {member.id === group.created_by && (
                                        <span className="text-[10px] bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">Admin</span>
                                    )}
                                </div>
                            </div>
                            {isCreator && member.id !== currentUserId && (
                                <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => handleRemoveMember(member.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Danger Zone */}
            {isCreator && (
                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                    <h3 className="text-red-600 font-medium mb-2">Danger Zone</h3>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">Delete Group</Button>
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
