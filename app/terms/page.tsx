import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Terms of Use – Adoptly",
  description: "The terms and conditions governing your use of the Adoptly platform.",
};

const LAST_UPDATED = "August 27, 2026";

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FDF4D2" }}>
      <header className="w-full px-5 py-4 border-b flex items-center gap-3" style={{ backgroundColor: "#FFFFFF", borderColor: "#D6C7B2" }}>
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.jpg" alt="Adoptly" width={30} height={30} className="rounded-xl object-cover" />
          <span className="text-lg font-bold" style={{ color: "#E8705A" }}>Adoptly</span>
        </Link>
        <span className="text-sm" style={{ color: "#9B8B84" }}>/</span>
        <span className="text-sm font-medium" style={{ color: "#3A2E2B" }}>Terms of Use</span>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#E8705A" }}>Legal</p>
        <h1 className="text-3xl sm:text-4xl font-black mb-2" style={{ color: "#3A2E2B" }}>Terms of Use</h1>
        <p className="text-sm mb-10" style={{ color: "#9B8B84" }}>Last updated: {LAST_UPDATED}</p>

        <div className="flex flex-col gap-8 text-sm leading-relaxed" style={{ color: "#3A2E2B" }}>

          <Section title="1. Acceptance of Terms">
            <p>By creating an account or using any part of the Adoptly platform (website and mobile application), you agree to be bound by these Terms of Use and our <Link href="/privacy" className="font-semibold underline" style={{ color: "#E8705A" }}>Privacy Policy</Link>. If you do not agree, do not use the platform.</p>
            <p className="mt-2">These terms are governed by the laws of the Republic of the Philippines.</p>
          </Section>

          <Section title="2. Eligibility">
            <ul className="list-disc pl-5 flex flex-col gap-1" style={{ color: "#6B5651" }}>
              <li>You must be at least 18 years old to create an account.</li>
              <li>You must provide accurate, current, and complete information during registration.</li>
              <li>One account per person. You may not create accounts on behalf of others without their consent.</li>
              <li>Accounts are personal and non-transferable.</li>
            </ul>
          </Section>

          <Section title="3. The Service">
            <p>Adoptly provides a platform that:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1 mt-2" style={{ color: "#6B5651" }}>
              <li>Allows pet owners to create listings for pets they wish to rehome</li>
              <li>Allows prospective adopters to browse listings and contact owners</li>
              <li>Facilitates direct communication between owners and adopters via in-app messaging</li>
            </ul>
            <p className="mt-2">Adoptly is a platform only. We do not take custody of animals, broker adoptions, or guarantee the accuracy of any listing. All adoption decisions are made solely between the owner and the adopter.</p>
          </Section>

          <Section title="4. User Responsibilities">
            <p>You agree that you will not:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1 mt-2" style={{ color: "#6B5651" }}>
              <li>Post false, misleading, or fraudulent listings</li>
              <li>List animals for sale disguised as adoption listings ("adoption fee" scams)</li>
              <li>Harass, threaten, or abuse other users</li>
              <li>Use the platform for illegal animal trade, breeding-for-profit schemes, or any activity prohibited by Philippine law</li>
              <li>Attempt to reverse engineer, scrape, or disrupt the platform</li>
              <li>Create multiple accounts to circumvent a ban</li>
              <li>Use another person's account or impersonate any individual</li>
            </ul>
          </Section>

          <Section title="5. Listings">
            <p>By posting a listing you confirm that:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1 mt-2" style={{ color: "#6B5651" }}>
              <li>You are the lawful owner or authorised carer of the pet</li>
              <li>All information provided (species, breed, age, health status) is accurate to the best of your knowledge</li>
              <li>Photos uploaded are your own or you have the right to use them</li>
              <li>The pet is not subject to any legal dispute or seizure order</li>
            </ul>
            <p className="mt-2">Adoptly reserves the right to remove any listing that violates these terms without prior notice.</p>
          </Section>

          <Section title="6. Content and Intellectual Property">
            <p>You retain ownership of content you upload (photos, descriptions). By uploading content, you grant Adoptly a non-exclusive, worldwide, royalty-free licence to display and distribute that content for the purpose of operating the platform.</p>
            <p className="mt-2">The Adoptly name, logo, and platform design are the intellectual property of the developer. You may not reproduce, copy, or create derivative works without written permission.</p>
          </Section>

          <Section title="7. Moderation and Account Suspension">
            <p>Adoptly moderates listings and user reports. We reserve the right to:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1 mt-2" style={{ color: "#6B5651" }}>
              <li>Remove any listing that violates these terms</li>
              <li>Suspend or permanently ban accounts for repeated or serious violations</li>
              <li>Share information with law enforcement where required by law</li>
            </ul>
            <p className="mt-2">If you believe your account was suspended in error, contact <strong>adoptlysupport@gmail.com</strong>.</p>
          </Section>

          <Section title="8. Disclaimers">
            <p>The Adoptly platform is provided "as is" without warranties of any kind. We do not warrant that:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1 mt-2" style={{ color: "#6B5651" }}>
              <li>The platform will be available at all times or error-free</li>
              <li>Any listing is accurate or that any adoption will be completed successfully</li>
              <li>The platform is free of harmful content uploaded by users</li>
            </ul>
          </Section>

          <Section title="9. Limitation of Liability">
            <p>To the maximum extent permitted by law, Adoptly and its developer shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform, including but not limited to disputes between users, failed adoptions, or animal welfare issues arising after adoption.</p>
          </Section>

          <Section title="10. Changes to These Terms">
            <p>We may update these terms at any time. Continued use of Adoptly after we post updated terms constitutes your acceptance of the changes. The "Last updated" date above will always reflect the most recent revision.</p>
          </Section>

          <Section title="11. Contact">
            <p>For any questions about these terms, email <strong>adoptlysupport@gmail.com</strong>.</p>
          </Section>

        </div>

        <div className="mt-12 pt-8 border-t flex flex-wrap gap-4 text-sm" style={{ borderColor: "#D6C7B2" }}>
          <Link href="/privacy" className="font-semibold hover:underline" style={{ color: "#E8705A" }}>Privacy Policy</Link>
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
