import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email manquant' }, { status: 400 });
    }

    const data = await resend.emails.send({
      from: 'Support <onboarding@resend.dev>', // Use onboarding@resend.dev for testing, or your custom verified domain later
      to: [email],
      subject: '🎉 Votre profil de professeur a été validé !',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #7c3aed;">Bonjour ${name},</h2>
          <p>Excellente nouvelle ! Votre profil a été examiné et <strong>validé</strong> par l'administration.</p>
          <p>Vous êtes désormais visible sur la plateforme et les élèves peuvent vous contacter pour réserver vos cours.</p>
          <br/>
          <p>Bienvenue à bord,</p>
          <p><strong>L'équipe de la plateforme</strong></p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Erreur Resend :", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}