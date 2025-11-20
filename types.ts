
// FIX: Import React to provide the React namespace for React.ReactNode.
import type * as React from 'react';

// --- Consultant System Types (Supabase Integrated) ---

export type ConsultantRole = 'admin' | 'leader' | 'consultant';

export interface Consultant {
    id: string; // Primary Key (000000, 00xxxx, 01xxxx)
    auth_id: string; // Foreign Key to Auth Users
    name: string;
    email: string;
    whatsapp: string;
    document_id?: string; // CPF or CNPJ
    address?: string; // Full Address
    city?: string; // Optional display helper
    state?: string; // Optional display helper
    role: ConsultantRole; // 'tipo_usuario'
    parent_id?: string; // 'id_convidante'
    created_at: string;
}

export interface ConsultantStats {
    totalConsultants: number;
    activeConsultants: number;
    totalTeams: number;
    newThisMonth: number;
}

export interface Sale {
    id: number;
    consultant_id: string;
    quantity: number;
    total_amount: number;
    created_at: string;
}

export interface Notification {
    id: number;
    user_id: string;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
}

export interface PrivateCustomer {
    id: number;
    consultant_id: string;
    name: string;
    phone: string;
    notes?: string;
    created_at: string;
}

export interface PrivateSale {
    id: number;
    consultant_id: string;
    customer_id?: number | null;
    product_name: string;
    quantity: number;
    sale_price: number;
    sale_date?: string;
    created_at: string;
}
