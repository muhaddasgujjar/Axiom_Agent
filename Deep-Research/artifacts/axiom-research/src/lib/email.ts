import emailjs from '@emailjs/browser';

export async function sendEmail(templateId: string, templateParams: Record<string, unknown>) {
  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      templateId,
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
    );
  } catch (error) {
    console.error('EmailJS send failed:', error);
    throw error;
  }
}
