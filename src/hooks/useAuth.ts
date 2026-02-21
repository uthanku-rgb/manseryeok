import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event: string, session: Session | null) => {
                setUser(session?.user ?? null);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signUpWithEmail = useCallback(async (email: string, password: string) => {
        setAuthError(null);
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) {
            setAuthError(error.message);
            return false;
        }
        return true;
    }, []);

    const signInWithEmail = useCallback(async (email: string, password: string) => {
        setAuthError(null);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            setAuthError(error.message);
            return false;
        }
        return true;
    }, []);

    const signOut = useCallback(async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Logout error:', error.message);
        }
    }, []);

    const clearError = useCallback(() => {
        setAuthError(null);
    }, []);

    return {
        user,
        loading,
        isLoggedIn: !!user,
        authError,
        signUpWithEmail,
        signInWithEmail,
        signOut,
        clearError,
    };
}
