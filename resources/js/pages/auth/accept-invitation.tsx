import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface Props {
    invitation: {
        email: string;
        organization: string;
        role: string;
        token: string;
    };
}

const acceptSchema = z
    .object({
        name: z.string().min(1, 'Name is required').max(255),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        password_confirmation: z
            .string()
            .min(1, 'Please confirm your password'),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: 'Passwords do not match',
        path: ['password_confirmation'],
    });

type AcceptFormValues = z.infer<typeof acceptSchema>;

export default function AcceptInvitation({ invitation }: Props) {
    const form = useForm<AcceptFormValues>({
        resolver: zodResolver(acceptSchema),
        defaultValues: { name: '', password: '', password_confirmation: '' },
    });

    function onSubmit(values: AcceptFormValues) {
        router.post(`/invitations/${invitation.token}/accept`, values, {
            onError: (errors) => {
                Object.entries(errors).forEach(([field, message]) =>
                    form.setError(field as keyof AcceptFormValues, { message }),
                );
            },
            onFinish: () => {
                form.setValue('password', '');
                form.setValue('password_confirmation', '');
            },
        });
    }

    return (
        <>
            <Head title="Accept invitation" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFDFC] p-6 text-[#1b1b18] dark:bg-[#0a0a0a]">
                <div className="w-full max-w-sm">
                    <div className="rounded-lg bg-white p-8 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                        <h1 className="mb-1 text-lg font-medium dark:text-[#EDEDEC]">
                            Join {invitation.organization}
                        </h1>
                        <p className="mb-6 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                            You've been invited as{' '}
                            <span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                {invitation.role}
                            </span>{' '}
                            to <strong>{invitation.email}</strong>.
                        </p>

                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="flex flex-col gap-4"
                            >
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Your name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    autoComplete="name"
                                                    autoFocus
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    autoComplete="new-password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password_confirmation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Confirm password
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    autoComplete="new-password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    disabled={form.formState.isSubmitting}
                                    className="mt-2 rounded-md bg-[#1b1b18] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#3b3b38] disabled:opacity-50 dark:bg-[#EDEDEC] dark:text-[#1b1b18] dark:hover:bg-white"
                                >
                                    {form.formState.isSubmitting
                                        ? 'Joining…'
                                        : 'Create account & join'}
                                </Button>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
}
