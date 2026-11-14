import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { professor_id, student_name, student_phone, student_email, subject, message } = body;

    if (!professor_id) {
      return NextResponse.json({ error: 'ID du professeur manquant' }, { status: 400 });
    }

    // Appel de la fonction RPC Supabase sécurisée et atomique
    const { data, error } = await supabase.rpc('create_lead_and_debit', {
      p_professor_id: professor_id,
      p_student_name: student_name,
      p_student_phone: student_phone,
      p_student_email: student_email,
      p_subject: subject,
      p_message: message,
    });

    if (error) throw error;

    if (!data.success) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: data.message });
  } catch (err: any) {
    console.error('Erreur API lead create :', err.message);
    return NextResponse.json({ error: err.message || 'Erreur interne du serveur' }, { status: 500 });
  }
}