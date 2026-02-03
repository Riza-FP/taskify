import type { AuthResponse } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase.js";
import type { LoginUserSchemaType, RegisterUserSchemaType } from "../types/auth.type.js";

export async function register(req: RegisterUserSchemaType): Promise<AuthResponse["data"]> {

    const { data, error } = await supabase.auth.signUp({
        email: req.email,
        password: req.password,
    });

    if (error) throw error;

    return data;
}


export async function login(req: LoginUserSchemaType): Promise<AuthResponse["data"]> {

    const { data, error } = await supabase.auth.signInWithPassword({
        email: req.email,
        password: req.password,
    });

    if (error) throw error;

    return data;
}
