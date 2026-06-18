import Link from 'next/link';

// Plain-language privacy policy. Honest, good-faith — not formal legal advice;
// worth a proper review before scaling, but accurate about how Life Book works.
export const metadata = { title: 'Privacy Policy · Life Book' };

const CONTACT_EMAIL = 'lifebooksupport@gmail.com'; // ← change this to whatever support email you want public

export default function Privacy() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 22px 80px', fontFamily: 'var(--sans)', color: 'var(--ink)' }}>
      <Link href="/" style={{ fontSize: 14, color: 'var(--plum)', textDecoration: 'none' }}>← Back to Life Book</Link>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 34, fontWeight: 700, margin: '20px 0 6px' }}>Privacy Policy</h1>
      <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginBottom: 28 }}>Last updated: 18 June 2026</p>

      <Section title="What Life Book is">
        Life Book is a personal planning app where you keep things like tasks, habits, goals, study notes,
        reading lists and reflections. This policy explains what information we handle and how.
      </Section>

      <Section title="Information we collect">
        <b>Account details.</b> When you sign up, our authentication provider (Clerk) stores your name and email
        so you can log in.<br /><br />
        <b>The content you create.</b> Anything you add inside the app — tasks, habits, goals, notes, books,
        reflections and so on — is stored so we can show it back to you.<br /><br />
        <b>Connected services.</b> If you choose to connect a third-party account (such as Notion or Google
        Calendar), we store the access tokens needed to fetch your data. These tokens are <b>encrypted</b> before
        they are saved, and are only ever used on your behalf.
      </Section>

      <Section title="How we use it">
        Only to provide the app: to show you your own data and the data from services you’ve connected.
        We do <b>not</b> sell your data, and we do <b>not</b> show advertising.
      </Section>

      <Section title="Who we share it with">
        We use a small number of trusted providers to run the service: <b>Clerk</b> (sign-in), <b>Neon</b> (database),
        and <b>Vercel</b> (hosting). If you connect an integration like <b>Notion</b> or <b>Google</b>, we communicate
        with that service only to provide the feature you asked for. We don’t share your data with anyone else.
      </Section>

      <Section title="Your data, your control">
        Your data is private to your account — other users cannot see it. You can disconnect any integration at
        any time from the Integrations page, which removes its stored tokens. To delete your account and its data,
        email us at the address below and we’ll remove it.
      </Section>

      <Section title="Security">
        Access is restricted to your signed-in account, and integration tokens are encrypted at rest. No system is
        perfectly secure, but we take reasonable steps to protect your information.
      </Section>

      <Section title="Contact">
        Questions or requests? Email <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--plum)' }}>{CONTACT_EMAIL}</a>.
      </Section>

      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 24 }}>
        We may update this policy as the app evolves; significant changes will be noted here.
      </p>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 24 }}>
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{title}</h2>
      <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--ink)' }}>{children}</p>
    </section>
  );
}
