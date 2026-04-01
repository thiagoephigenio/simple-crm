import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import LoginController from '@/actions/App/Http/Controllers/Auth/LoginController';
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

const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    function onSubmit(values: LoginFormValues) {
        router.post(LoginController.store().url, values, {
            onError: (errors) => {
                Object.entries(errors).forEach(([field, message]) =>
                    form.setError(field as keyof LoginFormValues, { message }),
                );
            },
            onFinish: () => form.setValue('password', ''),
        });
    }

    return (
        <>
            <Head title="Sign in" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFDFC] p-6 text-[#1b1b18] dark:bg-[#0a0a0a]">
                <div className="w-full max-w-sm">
                    <div className="rounded-lg bg-white p-8 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                        <h1 className="mb-1 text-lg font-medium dark:text-[#EDEDEC]">
                            Sign in to your account
                        </h1>
                        <p className="mb-6 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                            Don't have an account?{' '}
                            <Link
                                href="/register"
                                className="font-medium text-[#1b1b18] underline underline-offset-4 dark:text-[#EDEDEC]"
                            >
                                Create one
                            </Link>
                        </p>

                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="flex flex-col gap-4"
                            >
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    autoComplete="email"
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
                                                    autoComplete="current-password"
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
                                        ? 'Signing in…'
                                        : 'Sign in'}
                                </Button>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
}
