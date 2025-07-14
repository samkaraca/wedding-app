export interface Person {
    id: string;
    name: string;
    phone?: string;
    invited: boolean;
    side: 'gelin' | 'damat' | 'ortak';
    notes?: string;
}

export interface Contact {
    id: string;
    name: string;
    phoneNumbers?: Array<{ number?: string; label?: string }>;
}

export interface Expense {
    id: string;
    title: string;
    amount: number;
    category: string;
    date: string;
    notes?: string;
    paid: boolean;
}

export type FilterType = 'all' | 'not_invited'; 