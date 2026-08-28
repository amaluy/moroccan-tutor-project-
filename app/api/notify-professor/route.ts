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
      from: 'Soutien Scolaire <onboarding@resend.dev>',
      to: [email],
      subject: '🎉 Félicitations ! Votre profil a été accepté',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4F46E5;">Bonjour ${name || 'Professeur'},</h2>
          <p>Excellente nouvelle ! Votre demande d'inscription en tant que professeur sur notre plateforme a été <strong>acceptée</strong>.</p>
          <p>Votre profil est désormais visible en ligne pour les élèves et parents d'élèves.</p>
          <p>Pour finaliser votre inscription complète et configurer votre espace personnel, veuillez cliquer sur le lien ci-dessous afin de définir votre mot de passe :</p>
          <div style="margin: 30px 0;">
            <a href="https://votre-site.com/finalize-account?email=${encodeURIComponent(email)}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Finaliser mon inscription & mot de passe
            </a>
          </div>
          <p>Bienvenue parmi nous !</p>
          <p style="color: #6B7280; font-size: 12px; margin-top: 40px;">Ceci est un message automatique, merci de ne pas y répondre directement.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}