export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    current_organization_id: number | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Organization = {
    id: number;
    name: string;
    slug: string;
    plan: 'free' | 'basic' | 'pro';
};

export type Role = 'admin' | 'manager' | 'salesperson';

export type Auth = {
    user: User;
    organization: Organization | null;
    role: Role | null;
};
