import { Link, router, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Building2,
    ChevronDown,
    LayoutDashboard,
    LogOut,
    Plug,
    Settings,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import LogoutController from '@/actions/App/Http/Controllers/Auth/LogoutController';
import { cn } from '@/lib/utils';

interface NavItem {
    label: string;
    href: string;
    icon: ReactNode;
}

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: <LayoutDashboard size={18} />,
    },
    { label: 'Customers', href: '/customers', icon: <Building2 size={18} /> },
    { label: 'Sales', href: '/sales', icon: <BarChart3 size={18} /> },
    { label: 'Team', href: '/team', icon: <Users size={18} /> },
    { label: 'Integrations', href: '/integrations', icon: <Plug size={18} /> },
    { label: 'Settings', href: '/settings', icon: <Settings size={18} /> },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { auth } = usePage().props;
    const { url } = usePage();
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    function logout() {
        router.post(LogoutController.destroy().url);
    }

    return (
        <div className="flex h-screen bg-[#FDFDFC] dark:bg-[#0a0a0a]">
            {/* Sidebar */}
            <aside className="flex w-60 shrink-0 flex-col border-r border-[#e3e3e0] bg-white dark:border-[#1f1f1e] dark:bg-[#161615]">
                {/* Organization name */}
                <div className="flex h-14 items-center border-b border-[#e3e3e0] px-4 dark:border-[#1f1f1e]">
                    <span className="truncate text-sm font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                        {auth.organization?.name ?? 'CRM'}
                    </span>
                </div>

                {/* Navigation */}
                <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
                    {navItems.map((item) => {
                        const isActive = url.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                                    isActive
                                        ? 'bg-[#f0f0ee] font-medium text-[#1b1b18] dark:bg-[#1f1f1e] dark:text-[#EDEDEC]'
                                        : 'text-[#706f6c] hover:bg-[#f7f7f5] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:bg-[#1f1f1e] dark:hover:text-[#EDEDEC]',
                                )}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User menu */}
                <div className="border-t border-[#e3e3e0] p-2 dark:border-[#1f1f1e]">
                    <button
                        onClick={() => setUserMenuOpen((v) => !v)}
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-[#706f6c] transition-colors hover:bg-[#f7f7f5] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:bg-[#1f1f1e] dark:hover:text-[#EDEDEC]"
                    >
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#1b1b18] text-xs font-medium text-white dark:bg-[#EDEDEC] dark:text-[#1b1b18]">
                            {auth.user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="flex-1 truncate text-left">
                            {auth.user.name}
                        </span>
                        <ChevronDown
                            size={14}
                            className={cn(
                                'transition-transform',
                                userMenuOpen && 'rotate-180',
                            )}
                        />
                    </button>

                    {userMenuOpen && (
                        <div className="mt-1 rounded-md border border-[#e3e3e0] bg-white p-1 dark:border-[#1f1f1e] dark:bg-[#161615]">
                            <button
                                onClick={logout}
                                className="flex w-full items-center gap-2 rounded px-3 py-1.5 text-sm text-[#706f6c] transition-colors hover:bg-[#f7f7f5] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:bg-[#1f1f1e] dark:hover:text-[#EDEDEC]"
                            >
                                <LogOut size={14} />
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main content */}
            <main className="flex flex-1 flex-col overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
