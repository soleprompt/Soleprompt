import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${SITE.name}, including data collection and third-party integrations.`,
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      description={`How ${SITE.name} collects, uses, and protects your information.`}
      lastUpdated="July 5, 2026"
    >
      <section>
        <h2>1. Overview</h2>
        <p>
          {SITE.name} (&ldquo;SolePrompt,&rdquo; &ldquo;we,&rdquo;
          &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects your privacy. This
          policy describes what information we collect, how we use it, and the
          third-party services that help us operate the marketplace.
        </p>
      </section>

      <section>
        <h2>2. Information we collect</h2>
        <h3>Account and profile data</h3>
        <p>
          When you sign up or sign in, we receive information from{" "}
          <a
            href="https://clerk.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Clerk
          </a>
          , our authentication provider. This may include your name, email
          address, username, profile image, and account identifiers.
        </p>
        <h3>Marketplace activity</h3>
        <p>We store information related to your use of SolePrompt, including:</p>
        <ul>
          <li>Purchases, downloads, and transaction records</li>
          <li>Seller listings, earnings, and sales history</li>
          <li>Reviews, wishlists, favorites, and browsing history on the platform</li>
          <li>Onboarding preferences and account settings</li>
        </ul>
        <h3>Payment data</h3>
        <p>
          Paid purchases are processed by{" "}
          <a
            href="https://stripe.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Stripe
          </a>
          . We receive transaction confirmations, session IDs, and payment
          status — not your full card number.
        </p>
        <h3>Communications</h3>
        <p>
          We send transactional emails (such as purchase receipts, sale
          notifications, and welcome messages) through{" "}
          <a
            href="https://resend.com/legal/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Resend
          </a>
          . We use your email address and relevant purchase or account details
          to deliver these messages.
        </p>
        <h3>Technical data</h3>
        <p>
          We may collect standard server logs, cookies, and usage data needed to
          secure and operate the site. Clerk and Stripe may also set cookies or
          collect device information as described in their policies.
        </p>
      </section>

      <section>
        <h2>3. How we use information</h2>
        <p>We use collected information to:</p>
        <ul>
          <li>Provide, maintain, and improve the marketplace</li>
          <li>Process purchases, payouts, and account management</li>
          <li>Send transactional emails and service-related notices</li>
          <li>Prevent fraud, enforce our terms, and protect platform security</li>
          <li>Understand usage patterns and improve the user experience</li>
        </ul>
        <p>
          We do not sell your personal information to third parties for their
          marketing purposes.
        </p>
      </section>

      <section>
        <h2>4. Third-party services</h2>
        <p>
          SolePrompt relies on trusted providers to operate. Each processes data
          according to its own privacy policy:
        </p>
        <ul>
          <li>
            <strong className="text-foreground">Clerk</strong> — authentication
            and user identity
          </li>
          <li>
            <strong className="text-foreground">Stripe</strong> — payment
            processing
          </li>
          <li>
            <strong className="text-foreground">Resend</strong> — transactional
            email delivery
          </li>
          <li>
            <strong className="text-foreground">Hosting and database</strong> —
            infrastructure to store and serve platform data
          </li>
        </ul>
      </section>

      <section>
        <h2>5. X (Twitter) integration</h2>
        <p>
          SolePrompt includes an optional X integration used exclusively by
          platform administrators to publish approved promotional posts. General
          marketplace users do not connect X accounts through SolePrompt.
        </p>
        <h3>What we collect</h3>
        <p>
          When an admin connects an X account via OAuth, we receive and store:
        </p>
        <ul>
          <li>OAuth access token and access token secret (stored server-side)</li>
          <li>X user ID and screen name (handle)</li>
          <li>Connection timestamp and the admin user who authorized the connection</li>
        </ul>
        <h3>How we use it</h3>
        <ul>
          <li>
            To publish posts to the connected X account only when an admin
            explicitly approves or schedules them
          </li>
          <li>
            To display connection status in the admin social settings panel
          </li>
        </ul>
        <h3>What we do not do</h3>
        <ul>
          <li>We do not read your X DMs, followers list, or private messages</li>
          <li>We do not auto-post without admin approval</li>
          <li>We do not send direct messages, spam, or unsolicited outreach</li>
          <li>We do not share X OAuth tokens with other users or third parties</li>
        </ul>
        <p>
          SolePrompt is not affiliated with, endorsed by, or sponsored by X
          Corp. Your use of X is also governed by{" "}
          <a
            href="https://x.com/en/tos"
            target="_blank"
            rel="noopener noreferrer"
          >
            X&apos;s Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="https://x.com/en/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            X&apos;s Privacy Policy
          </a>
          . Admins may disconnect the X account at any time, which deletes stored
          OAuth tokens from our database.
        </p>
      </section>

      <section>
        <h2>6. Data retention</h2>
        <p>
          We retain account and transaction data for as long as your account is
          active or as needed to provide services, comply with legal obligations,
          resolve disputes, and enforce agreements. X OAuth tokens are removed
          when an admin disconnects the integration.
        </p>
      </section>

      <section>
        <h2>7. Your choices</h2>
        <p>
          You may update profile information through your account settings.
          Transactional emails related to purchases and account activity are
          part of the service. To request account deletion or data access,
          contact us using the details below.
        </p>
      </section>

      <section>
        <h2>8. Security</h2>
        <p>
          We use industry-standard measures to protect data, including encrypted
          connections and access controls. No method of transmission or storage
          is completely secure, and we cannot guarantee absolute security.
        </p>
      </section>

      <section>
        <h2>9. Changes</h2>
        <p>
          We may update this policy from time to time. Material changes will be
          reflected by updating the &ldquo;Last updated&rdquo; date at the top
          of this page.
        </p>
      </section>

      <section>
        <h2>10. Contact</h2>
        <p>
          Privacy questions or requests? Contact us through the platform. See
          also our <Link href="/terms">Terms of Service</Link>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
