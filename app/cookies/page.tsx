import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Cookie Policy – Adoptly",
  description: "How Adoptly uses cookies and similar tracking technologies.",
};

const LAST_UPDATED = "August 27, 2026";

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FDF4D2" }}>
      <header className="w-full px-5 py-4 border-b flex items-center gap-3" style={{ backgroundColor: "#FFFFFF", borderColor: "#D6C7B2" }}>
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.jpg" alt="Adoptly" width={30} height={30} className="rounded-xl object-cover" />
          <span className="text-lg font-bold" style={{ color: "#E8705A" }}>Adoptly</span>
        </Link>
        <span className="text-sm" style={{ color: "#9B8B84" }}>/</span>
        <span className="text-sm font-medium" style={{ color: "#3A2E2B" }}>Cookie Policy</span>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#E8705A" }}>Legal</p>
        <h1 className="text-3xl sm:text-4xl font-black mb-2" style={{ color: "#3A2E2B" }}>Cookie Policy</h1>
        <p className="text-sm mb-10" style={{ color: "#9B8B84" }}>Last updated: {LAST_UPDATED}</p>

        <div className="flex flex-col gap-8 text-sm leading-relaxed" style={{ color: "#3A2E2B" }}>

          <Section title="1. What Are Cookies?">
            <p>Cookies are small text files placed on your device when you visit a website. They allow the site to recognise your device, remember your preferences, and understand how you interact with it. Similar technologies include localStorage and sessionStorage, which Adoptly also uses for in-browser data persistence.</p>
          </Section>

          <Section title="2. How We Use Cookies">
            <p>Adoptly uses cookies and browser storage for three purposes:</p>

            <div className="mt-4 flex flex-col gap-4">
              <CookieTable
                category="Essential"
                required
                purpose="These are necessary for the platform to function. They manage your authentication session so you stay logged in, and store your active conversation state."
                examples={[
                  { name: "supabase-auth-token", provider: "Supabase", expiry: "Session" },
                  { name: "sb-access-token",     provider: "Supabase", expiry: "1 hour"  },
                  { name: "sb-refresh-token",    provider: "Supabase", expiry: "7 days"  },
                ]}
              />
              <CookieTable
                category="Preference"
                required={false}
                purpose="These remember choices you have made inside the app, such as your saved favourite pet IDs stored in localStorage. They make your experience more convenient."
                examples={[
                  { name: "adoptly_favorites", provider: "Adoptly (localStorage)", expiry: "Persistent" },
                ]}
              />
              <CookieTable
                category="Analytics"
                required={false}
                purpose="These help us understand how users navigate the platform so we can improve it. Data is anonymised and aggregated — no personally identifiable information is collected. Analytics cookies are only set after you accept via the cookie banner."
                examples={[
                  { name: "adoptly_cookie_consent", provider: "Adoptly (localStorage)", expiry: "1 year" },
                ]}
              />
            </div>
          </Section>

          <Section title="3. Third-Party Cookies">
            <p>Adoptly does not embed third-party advertising or social media trackers. The only third-party service that may set cookies is <strong>Supabase</strong>, our authentication and database provider, which sets session tokens necessary for login to work.</p>
          </Section>

          <Section title="4. Your Choices">
            <p>When you first visit Adoptly you will see a cookie consent banner. You can:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1 mt-2" style={{ color: "#6B5651" }}>
              <li><strong>Accept all</strong> — enables essential, preference, and analytics cookies</li>
              <li><strong>Decline</strong> — only essential cookies are used; analytics are disabled</li>
            </ul>
            <p className="mt-2">You can withdraw or change your consent at any time by clearing your browser cookies and localStorage, which will re-show the consent banner on your next visit.</p>
            <p className="mt-2">You can also control cookies through your browser settings. Most browsers allow you to block or delete cookies. Note that blocking essential cookies will prevent you from staying logged in.</p>
          </Section>

          <Section title="5. Changes to This Policy">
            <p>We may update this Cookie Policy when we change the cookies we use. The "Last updated" date above reflects the most recent revision. Continued use of Adoptly after changes constitutes acceptance.</p>
          </Section>

          <Section title="6. Contact">
            <p>If you have questions about how we use cookies, email <strong>adoptlysupport@gmail.com</strong>.</p>
          </Section>

        </div>

        <div className="mt-12 pt-8 border-t flex flex-wrap gap-4 text-sm" style={{ borderColor: "#D6C7B2" }}>
          <Link href="/privacy" className="font-semibold hover:underline" style={{ color: "#E8705A" }}>Privacy Policy</Link>
          <Link href="/terms"   className="font-semibold hover:underline" style={{ color: "#E8705A" }}>Terms of Use</Link>
          <Link href="/"        className="font-semibold hover:underline" style={{ color: "#6B5651" }}>Back to Home</Link>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-black mb-3" style={{ color: "#3A2E2B" }}>{title}</h2>
      <div style={{ color: "#6B5651" }}>{children}</div>
    </div>
  );
}

function CookieTable({
  category,
  required,
  purpose,
  examples,
}: {
  category: string;
  required: boolean;
  purpose: string;
  examples: { name: string; provider: string; expiry: string }[];
}) {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "#D6C7B2" }}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: "#FDFAF6" }}>
        <p className="font-bold text-sm" style={{ color: "#3A2E2B" }}>{category}</p>
        <span
          className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full"
          style={{
            backgroundColor: required ? "#A3B18A33" : "#E0A96D33",
            color: required ? "#3A6020" : "#9B6A2A",
          }}
        >
          {required ? "Always on" : "Optional"}
        </span>
      </div>
      <div className="px-4 py-3 border-t text-xs" style={{ borderColor: "#EDE5D8", color: "#6B5651" }}>
        <p>{purpose}</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: "#9B8B84" }}>
                <th className="text-left pb-1.5 pr-4 font-semibold">Name</th>
                <th className="text-left pb-1.5 pr-4 font-semibold">Provider</th>
                <th className="text-left pb-1.5 font-semibold">Expiry</th>
              </tr>
            </thead>
            <tbody>
              {examples.map(e => (
                <tr key={e.name} className="border-t" style={{ borderColor: "#EDE5D8" }}>
                  <td className="py-1.5 pr-4 font-mono" style={{ color: "#3A2E2B" }}>{e.name}</td>
                  <td className="py-1.5 pr-4">{e.provider}</td>
                  <td className="py-1.5">{e.expiry}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
