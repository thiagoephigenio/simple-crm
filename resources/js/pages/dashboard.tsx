import { Head } from '@inertiajs/react';

import AdminLayout from '@/layouts/admin-layout';

export default function Dashboard() {
    return (
        <AdminLayout>
            <Head title="Dashboard" />
            <div className="p-8">
                <h1 className="text-xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                    Dashboard
                </h1>
                <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                    Welcome to your CRM workspace.
                </p>
            </div>
        </AdminLayout>
    );
}
