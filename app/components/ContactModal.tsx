// Extrait de l'appel dans ContactModal.tsx
const handleSubmitLead = async (formData: any) => {
  try {
    const res = await fetch('/api/leads/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        professor_id: professor.id,
        student_name: formData.name,
        student_phone: formData.phone,
        student_email: formData.email,
        subject: formData.subject,
        message: formData.message,
      }),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Erreur lors de l\'envoi');

    alert('Votre demande a bien été envoyée au professeur !');
    onClose();
  } catch (err: any) {
    alert(`Erreur : ${err.message}`);
  }
};