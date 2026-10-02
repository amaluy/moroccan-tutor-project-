import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ydrswexzawreqrnuqwkh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkcnN3ZXh6YXdyZXFybnVxd2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5ODQxMTksImV4cCI6MjEwMjU2MDExOX0.bFa0n1y0Q6T3Pb0KnGvjfcKAHYBrqt3JM8v3mnrkrD8';

// Empêche la création de multiples instances lors des rechargements (HMR) de Next.js
const globalForSupabase = globalThis as unknown as { supabase: ReturnType<typeof createClient> };

export const supabase = globalForSupabase.supabase || createClient(supabaseUrl, supabaseAnonKey);

if (process.env.NODE_ENV !== 'production') {
  globalForSupabase.supabase = supabase;
}