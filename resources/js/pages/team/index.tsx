import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router, usePage } from '@inertiajs/react';
import { MailOpen, RefreshCw, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import InvitationController from '@/actions/App/Http/Controllers/Auth/InvitationController';
import TeamController from '@/actions/App/Http/Controllers/TeamController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AdminLayout from '@/layouts/admin-layout';
import type { Role } from '@/types';

interface Member {
    id: number;
    name: string;
    email: string;
    role: Role;
    is_current_user: boolean;
}

interface PendingInvitation {
    id: number;
    email: string;
    role: Role;
    expires_at: string;
}

interface Props {
    members: Member[];
    pendingInvitations: PendingInvitation[];
}

const roleLabels: Record<Role, string> = {
    admin: 'Admin',
    manager: 'Manager',
    salesperson: 'Salesperson',
};

const roleVariants: Record<Role, 'default' | 'secondary' | 'outline'> = {
    admin: 'default',
    manager: 'secondary',
    salesperson: 'outline',
};

const inviteSchema = z.object({
    email: z.string().min(1, 'Email is required').email(),
    role: z.enum(['admin', 'manager', 'salesperson']),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

function InviteDialog() {
    const [open, setOpen] = useState(false);
    const form = useForm<InviteFormValues>({
        resolver: zodResolver(inviteSchema),
        defaultValues: { email: '', role: 'salesperson' },
    });

    function onSubmit(values: InviteFormValues) {
        router.post(InvitationController.store().url, values, {
            onSuccess: () => {
                setOpen(false);
                form.reset();
            },
            onError: (errors) => {
                Object.entries(errors).forEach(([field, message]) =>
                    form.setError(field as keyof InviteFormValues, { message }),
                );
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button size="sm" className="gap-2" />}>
                <UserPlus size={15} />
                Invite member
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite a team member</DialogTitle>
                    <DialogDescription>
                        They'll receive an email with a link to join your
                        organization.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col gap-4 pt-2"
                    >
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email address</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="colleague@company.com"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="admin">
                                                Admin
                                            </SelectItem>
                                            <SelectItem value="manager">
                                                Manager
                                            </SelectItem>
                                            <SelectItem value="salesperson">
                                                Salesperson
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting
                                    ? 'Sending…'
                                    : 'Send invitation'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function RoleSelect({ member }: { member: Member }) {
    const isCurrentUser = member.is_current_user;

    function onChange(role: string | null) {
        if (!role) {
            return;
        }

        router.patch(TeamController.update(member.id).url, { role });
    }

    return (
        <Select
            defaultValue={member.role}
            onValueChange={onChange}
            disabled={isCurrentUser}
        >
            <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="salesperson">Salesperson</SelectItem>
            </SelectContent>
        </Select>
    );
}

export default function TeamIndex({ members, pendingInvitations }: Props) {
    const { auth } = usePage().props;
    const isAdmin = auth.role === 'admin';

    function removeMember(member: Member) {
        if (!confirm(`Remove ${member.name} from the organization?`)) {
            return;
        }

        router.delete(TeamController.destroy(member.id).url);
    }

    function resendInvitation(invitation: PendingInvitation) {
        router.post(TeamController.resendInvitation(invitation.id).url);
    }

    function cancelInvitation(invitation: PendingInvitation) {
        router.delete(TeamController.destroyInvitation(invitation.id).url);
    }

    return (
        <AdminLayout>
            <Head title="Team" />
            <div className="p-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                            Team
                        </h1>
                        <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                            {members.length}{' '}
                            {members.length === 1 ? 'member' : 'members'}
                        </p>
                    </div>
                    {isAdmin && <InviteDialog />}
                </div>

                {/* Members list */}
                <div className="rounded-lg border border-[#e3e3e0] bg-white dark:border-[#1f1f1e] dark:bg-[#161615]">
                    {members.map((member, index) => (
                        <div key={member.id}>
                            {index > 0 && <Separator />}
                            <div className="flex items-center gap-4 px-4 py-3">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#1b1b18] text-sm font-medium text-white dark:bg-[#EDEDEC] dark:text-[#1b1b18]">
                                    {member.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="truncate text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                            {member.name}
                                        </span>
                                        {member.is_current_user && (
                                            <span className="text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                                (you)
                                            </span>
                                        )}
                                    </div>
                                    <p className="truncate text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                        {member.email}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isAdmin ? (
                                        <RoleSelect member={member} />
                                    ) : (
                                        <Badge
                                            variant={roleVariants[member.role]}
                                        >
                                            {roleLabels[member.role]}
                                        </Badge>
                                    )}
                                    {isAdmin && !member.is_current_user && (
                                        <button
                                            onClick={() => removeMember(member)}
                                            className="rounded p-1 text-[#706f6c] transition-colors hover:bg-[#f7f7f5] hover:text-red-600 dark:text-[#A1A09A] dark:hover:bg-[#1f1f1e]"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pending invitations */}
                {pendingInvitations.length > 0 && (
                    <div className="mt-8">
                        <h2 className="mb-3 text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                            Pending invitations
                        </h2>
                        <div className="rounded-lg border border-[#e3e3e0] bg-white dark:border-[#1f1f1e] dark:bg-[#161615]">
                            {pendingInvitations.map((invitation, index) => (
                                <div key={invitation.id}>
                                    {index > 0 && <Separator />}
                                    <div className="flex items-center gap-4 px-4 py-3">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-dashed border-[#e3e3e0] dark:border-[#1f1f1e]">
                                            <MailOpen
                                                size={14}
                                                className="text-[#706f6c] dark:text-[#A1A09A]"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                                                {invitation.email}
                                            </p>
                                            <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                                Invited as{' '}
                                                {roleLabels[invitation.role]}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">
                                                Pending
                                            </Badge>
                                            {isAdmin && (
                                                <button
                                                    onClick={() =>
                                                        resendInvitation(
                                                            invitation,
                                                        )
                                                    }
                                                    title="Resend invitation"
                                                    className="rounded p-1 text-[#706f6c] transition-colors hover:bg-[#f7f7f5] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:bg-[#1f1f1e] dark:hover:text-[#EDEDEC]"
                                                >
                                                    <RefreshCw size={14} />
                                                </button>
                                            )}
                                            {isAdmin && (
                                                <button
                                                    onClick={() =>
                                                        cancelInvitation(
                                                            invitation,
                                                        )
                                                    }
                                                    className="rounded p-1 text-[#706f6c] transition-colors hover:bg-[#f7f7f5] hover:text-red-600 dark:text-[#A1A09A] dark:hover:bg-[#1f1f1e]"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
