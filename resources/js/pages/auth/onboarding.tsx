import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import OnboardingController from '@/actions/App/Http/Controllers/Auth/OnboardingController';
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

const onboardingSchema = z.object({
    name: z.string().min(1, 'Organization name is required').max(255),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export default function Onboarding() {
    const form = useForm<OnboardingFormValues>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: { name: '' },
    });

    function onSubmit(values: OnboardingFormValues) {
        router.post(OnboardingController.store().url, values, {
            onError: (errors) => {
                Object.entries(errors).forEach(([field, message]) =>
                    form.setError(field as keyof OnboardingFormValues, {
                        message,
                    }),
                );
            },
        });
    }

    return (
        <>
            <Head title="Create your organization" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFDFC] p-6 text-[#1b1b18] dark:bg-[#0a0a0a]">
                <div className="w-full max-w-sm">
                    <div className="rounded-lg bg-white p-8 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                        <h1 className="mb-1 text-lg font-medium dark:text-[#EDEDEC]">
                            Create your organization
                        </h1>
                        <p className="mb-6 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                            This is your workspace. You can invite your team
                            after setup.
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
                                            <FormLabel>
                                                Organization name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Acme Corp"
                                                    autoFocus
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
                                        ? 'Creating…'
                                        : 'Create organization'}
                                </Button>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
}
