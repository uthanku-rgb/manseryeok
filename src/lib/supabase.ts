import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type ManseryeokClient = {
    id: string;
    user_id: string;
    name: string;
    birth_year: number;
    birth_month: number;
    birth_day: number;
    birth_hour: number | null;
    gender: '남' | '여';
    calendar: 'solar' | 'lunar';
    memo: string | null;
    created_at: string;
    updated_at: string;
};

// ──────────────────────────────────────────────
// Client CRUD
// ──────────────────────────────────────────────

export async function fetchClients(): Promise<ManseryeokClient[]> {
    const { data, error } = await supabase
        .from('manseryeok_clients')
        .select('*')
        .order('updated_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
}

export async function saveClient(client: Omit<ManseryeokClient, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ManseryeokClient> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('로그인이 필요합니다.');

    const { data, error } = await supabase
        .from('manseryeok_clients')
        .insert({ ...client, user_id: user.id })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateClient(id: string, updates: Partial<Pick<ManseryeokClient, 'name' | 'memo'>>): Promise<ManseryeokClient> {
    const { data, error } = await supabase
        .from('manseryeok_clients')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteClient(id: string): Promise<void> {
    const { error } = await supabase
        .from('manseryeok_clients')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
