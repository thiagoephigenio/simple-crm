import { cn } from '@/lib/utils';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/register', {
            onFinish: () => setData('password', '') || setData('password_confirmation', ''),
        });
    }

    return (
        <>
            <Head title="Create account" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFDFC] p-6 text-[#1b1b18] dark:bg-[#0a0a0a]">
                <div className="w-full max-w-sm">
                    <div className="rounded-lg bg-white p-8 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                        <h1 className="mb-1 text-lg font-medium dark:text-[#EDEDEC]">
                            Create your account
                        </h1>
                        <p className="mb-6 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                className="font-medium text-[#1b1b18] underline underline-offset-4 dark:text-[#EDEDEC]"
                            >
                                Sign in
                            </Link>
                        </p>

                        <form onSubmit={submit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label
                                    htmlFor="name"
                                    className="text-sm font-medium dark:text-[#EDEDEC]"
                                >
                                    Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    autoComplete="name"
                                    className={cn(
                                        'rounded-md border border-[#e3e3e0] bg-[#FDFDFC] px-3 py-2 text-sm outline-none transition',
                                        'placeholder:text-[#b5b4af] focus:border-[#1b1b18] focus:ring-1 focus:ring-[#1b1b18]',
                                        'dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC] dark:focus:border-[#EDEDEC] dark:focus:ring-[#EDEDEC]',
                                        errors.name &&
                                            'border-red-500 focus:border-red-500 focus:ring-red-500',
                                    )}
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-1">
                                <label
                                    htmlFor="email"
                                    className="text-sm font-medium dark:text-[#EDEDEC]"
                                >
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    autoComplete="email"
                                    className={cn(
                                        'rounded-md border border-[#e3e3e0] bg-[#FDFDFC] px-3 py-2 text-sm outline-none transition',
                                        'placeholder:text-[#b5b4af] focus:border-[#1b1b18] focus:ring-1 focus:ring-[#1b1b18]',
                                        'dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC] dark:focus:border-[#EDEDEC] dark:focus:ring-[#EDEDEC]',
                                        errors.email &&
                                            'border-red-500 focus:border-red-500 focus:ring-red-500',
                                    )}
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-1">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium dark:text-[#EDEDEC]"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    autoComplete="new-password"
                                    className={cn(
                                        'rounded-md border border-[#e3e3e0] bg-[#FDFDFC] px-3 py-2 text-sm outline-none transition',
                                        'placeholder:text-[#b5b4af] focus:border-[#1b1b18] focus:ring-1 focus:ring-[#1b1b18]',
                                        'dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC] dark:focus:border-[#EDEDEC] dark:focus:ring-[#EDEDEC]',
                                        errors.password &&
                                            'border-red-500 focus:border-red-500 focus:ring-red-500',
                                    )}
                                />
                                {errors.password && (
                                    <p className="text-xs text-red-500">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-1">
                                <label
                                    htmlFor="password_confirmation"
                                    className="text-sm font-medium dark:text-[#EDEDEC]"
                                >
                                    Confirm password
                                </label>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    autoComplete="new-password"
                                    className={cn(
                                        'rounded-md border border-[#e3e3e0] bg-[#FDFDFC] px-3 py-2 text-sm outline-none transition',
                                        'placeholder:text-[#b5b4af] focus:border-[#1b1b18] focus:ring-1 focus:ring-[#1b1b18]',
                                        'dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC] dark:focus:border-[#EDEDEC] dark:focus:ring-[#EDEDEC]',
                                        errors.password_confirmation &&
                                            'border-red-500 focus:border-red-500 focus:ring-red-500',
                                    )}
                                />
                                {errors.password_confirmation && (
                                    <p className="text-xs text-red-500">
                                        {errors.password_confirmation}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-2 rounded-md bg-[#1b1b18] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#3b3b38] disabled:opacity-50 dark:bg-[#EDEDEC] dark:text-[#1b1b18] dark:hover:bg-white"
                            >
                                {processing ? 'Creating account…' : 'Create account'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
