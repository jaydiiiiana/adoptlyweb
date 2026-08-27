import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy – Adoptly",
  description: "How Adoptly collects, uses, and protects your personal data.",
};

const LAST_UPDATED = "August 27, 2026";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FDF4D2" }}>
      {/* Top bar */}
      <header className="w-full px-5 py-4 border-b flex items-center gap-3" style={{ backgroundColor: "#FFFFFF", borderColor: "#D6C7B2" }}>
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.jpg" alt="Adoptly" width={30} height={30} className="rounded-xl object-cover" />
          <span className="text-lg font-bold" style={{ color: "#E8705A" }}>Adoptly</span>
        </Link>
        <span className="text-sm" style={{ color: "#9B8B84" }}>/</span>
        <span className="text-sm font-medium" style={{ color: "#3A2E2B" }}>Privacy Policy</span>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#E8705A" }}>Legal</p>
        <h1 className="text-3xl sm:text-4xl font-black mb-2" style={{ color: "#3A2E2B" }}>Privacy Policy</h1>
        <p className="text-sm mb-10" style={{ color: "#9B8B84" }}>Last updated: {LAST_UPDATED}</p>

        <div className="flex flex-col gap-8 text-sm leading-relaxed" style={{ color: "#3A2E2B" }}>

          <Section title="1. Who We Are">
            <p>Adoptly is a pet adoption platform built and operated by a solo independent developer based in the Philippines. Our platform allows pet owners to list animals for adoption and allows prospective adopters to browse listings and communicate with owners.</p>
            <p className="mt-2">If you have questions about this policy, contact us at <strong>adoptlysupport@gmail.com</strong>.</p>
          </Section>

          <Section title="2. Information We Collect">
            <p className="font-semibold mb-1">Information you provide directly:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1" style={{ color: "#6B5651" }}>
              <li>Full name, email address, and password when you register</li>
              <li>Street address, city, and postal code for proximity-based listing matching</li>
              <li>Phone number (optional)</li>
              <li>Pet listing details: photos, descriptions, breed, age, species</li>
              <li>Messages sent through the in-app chat</li>
              <li>Reports submitted about other users or listings</li>
            </ul>
            <p className="font-semibold mt-3 mb-1">Information collected automatically:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1" style={{ color: "#6B5651" }}>
              <li>Browser type, device type, and operating system</li>
              <li>Pages visited and features used within the app</li>
              <li>IP address and approximate location derived from it</li>
              <li>Cookie identifiers (see Section 7)</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul className="list-disc pl-5 flex flex-col gap-1" style={{ color: "#6B5651" }}>
              <li>To create and manage your account</li>
              <li>To display your pet listings to other users</li>
              <li>To sort nearby listings based on your city</li>
              <li>To enable real-time messaging between adopters and owners</li>
              <li>To investigate reports of suspicious or abusive behaviour</li>
              <li>To send transactional emails (account confirmation, password reset)</li>
              <li>To improve the platform through aggregate, anonymised analytics</li>
            </ul>
            <p className="mt-2">We do <strong>not</strong> sell your personal data to third parties. We do not use your data for advertising profiling.</p>
          </Section>

          <Section title="4. Legal Basis for Processing">
            <p>We process your personal data under the following bases:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1 mt-2" style={{ color: "#6B5651" }}>
              <li><strong>Contract performance</strong> — to provide the service you signed up for</li>
              <li><strong>Legitimate interests</strong> — to detect fraud, abuse, and improve the platform</li>
              <li><strong>Consent</strong> — for non-essential cookies and optional communications</li>
              <li><strong>Legal obligation</strong> — where required by Philippine law (Republic Act No. 10173, Data Privacy Act of 2012)</li>
            </ul>
          </Section>

          <Section title="5. Data Sharing">
            <p>We share your data only with:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1 mt-2" style={{ color: "#6B5651" }}>
              <li><strong>Supabase</strong> — our database and authentication provider (data stored in Singapore region)</li>
              <li><strong>Supabase Storage</strong> — for pet photo uploads</li>
              <li><strong>Vercel</strong> — our hosting provider for the web frontend</li>
            </ul>
            <p className="mt-2">All third-party providers are bound by data processing agreements and are prohibited from using your data for their own purposes.</p>
          </Section>

          <Section title="6. Data Retention">
            <p>We keep your account data for as long as your account is active. If you delete your account, we will remove your personal data within 30 days except where we are required to retain it for legal reasons.</p>
            <p className="mt-2">Pet listing photos stored in Supabase Storage are deleted when a listing is permanently removed.</p>
          </Section>

          <Section title="7. Cookies">
            <p>We use the following types of cookies:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1 mt-2" style={{ color: "#6B5651" }}>
              <li><strong>Essential cookies</strong> — required for authentication and session management. Cannot be disabled.</li>
              <li><strong>Preference cookies</strong> — remember your in-app settings (e.g. favourite pets stored in localStorage).</li>
              <li><strong>Analytics cookies</strong> — anonymous usage data to improve the platform. Only set after you accept cookies.</li>
            </ul>
            <p className="mt-2">You can manage or withdraw cookie consent at any time via the cookie banner or your browser settings. See our <Link href="/cookies" className="font-semibold underline" style={{ color: "#E8705A" }}>Cookie Policy</Link> for details.</p>
          </Section>

          <Section title="8. Your Rights">
            <p>Under the Philippine Data Privacy Act (RA 10173), you have the right to:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1 mt-2" style={{ color: "#6B5651" }}>
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate or outdated information</li>
              <li>Request erasure of your personal data</li>
              <li>Object to or restrict how we process your data</li>
              <li>Data portability — receive a copy of your data in a machine-readable format</li>
              <li>Lodge a complaint with the National Privacy Commission (NPC)</li>
            </ul>
            <p className="mt-2">To exercise any of these rights, email <strong>adoptlysupport@gmail.com</strong>. We will respond within 15 business days.</p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>Adoptly is not directed at children under 13 years of age. We do not knowingly collect personal data from children. If we discover that a child has provided us with personal information, we will delete it immediately.</p>
          </Section>

          <Section title="10. Security">
            <p>We implement industry-standard security measures including HTTPS encryption, row-level security on the database, and hashed passwords managed by Supabase Auth. However, no method of internet transmission is 100% secure and we cannot guarantee absolute security.</p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. When we make material changes we will update the "Last updated" date at the top of this page. Continued use of Adoptly after changes constitutes acceptance of the updated policy.</p>
          </Section>

        </div>

        <div className="mt-12 pt-8 border-t flex flex-wrap gap-4 text-sm" style={{ borderColor: "#D6C7B2" }}>
          <Link href="/terms"   className="font-semibold hover:underline" style={{ color: "#E8705A" }}>Terms of Use</Link>
          <Link href="/cookies" className="font-semibold hover:underline" style={{ color: "#E8705A" }}>Cookie Policy</Link>
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
