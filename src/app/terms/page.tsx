import Link from 'next/link';

export const metadata = { title: 'Terms of Use · Life Book' };

const CONTACT_EMAIL = 'lifebooksupport@gmail.com'; // ← change this to whatever support email you want public

export default function Terms() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 22px 80px', fontFamily: 'var(--sans)', color: 'var(--ink)' }}>
      <Link href="/" style={{ fontSize: 14, color: 'var(--plum)', textDecoration: 'none' }}>← Back to Life Book</Link>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 34, fontWeight: 700, margin: '20px 0 6px' }}>Terms of Use</h1>
      <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginBottom: 28 }}>Last updated: 18 June 2026</p>

      <Section title="Using Life Book">
        By creating an account you agree to these terms. Life Book is a personal planning tool for your own
        organisation and productivity. Please use it lawfully and don’t attempt to disrupt the service or access
        other people’s accounts or data.
      </Section>

      <Section title="Your account">
        You’re responsible for keeping your login secure. The data you add is yours; you’re responsible for what
        you choose to store and connect.
      </Section>

      <Section title="Connected services">
        When you connect a third-party account (such as Notion or Google), you authorise Life Book to access the
        data needed for that feature, on your behalf. You can revoke this at any time from the Integrations page,
        or from the third-party service’s own settings.
      </Section>

      <Section title="Availability and “as is”">
        Life Book is provided on an “as is” basis, without warranties of any kind. We aim to keep it running well,
        but we can’t guarantee it will always be available or error-free, and features may change over time.
      </Section>

      <Section title="Limitation of liability">
        To the extent permitted by law, Life Book and its creator are not liable for any loss arising from your
        use of the service. Please keep your own copies of anything important.
      </Section>

      <Section title="Changes & contact">
        We may update these terms as the app develops; continued use means you accept the current version.
        Questions? Email <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--plum)' }}>{CONTACT_EMAIL}</a>.
      </Section>
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
