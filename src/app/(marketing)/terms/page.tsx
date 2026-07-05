import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of Service for ${SITE.name}, the marketplace for premium AI prompts.`,
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      description={`Rules and conditions for using ${SITE.name}.`}
      lastUpdated="July 5, 2026"
    >
      <section>
        <h2>1. Agreement</h2>
        <p>
          By accessing or using {SITE.name} (&ldquo;SolePrompt,&rdquo;
          &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), you agree
          to these Terms of Service. If you do not agree, do not use the
          platform.
        </p>
      </section>

      <section>
        <h2>2. Marketplace</h2>
        <p>
          SolePrompt is a marketplace where sellers list AI prompts and buyers
          purchase or download them. We facilitate discovery, checkout, and
          delivery but are not a party to transactions between buyers and
          sellers.
        </p>
        <ul>
          <li>
            <strong className="text-foreground">Accounts.</strong> You must
            create an account to buy, sell, or manage content. You are
            responsible for activity under your account.
          </li>
          <li>
            <strong className="text-foreground">Listings.</strong> Sellers
            represent that their prompts are original or properly licensed and
            accurately described.
          </li>
          <li>
            <strong className="text-foreground">Purchases.</strong> Paid
            purchases are processed through Stripe. Free downloads may also be
            offered at a seller&apos;s discretion.
          </li>
          <li>
            <strong className="text-foreground">Refunds.</strong> If a prompt
            does not perform as described, buyers may request a refund within 7
            days of purchase, subject to review.
          </li>
          <li>
            <strong className="text-foreground">Licenses.</strong> Unless a
            listing states otherwise, purchased prompts include a commercial
            license for the buyer&apos;s use.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Seller obligations</h2>
        <p>Sellers agree to:</p>
        <ul>
          <li>Provide accurate listing details and compatible model information</li>
          <li>Not upload infringing, misleading, or harmful content</li>
          <li>Honor stated usage rights and refund policies</li>
          <li>Comply with applicable laws and platform guidelines</li>
        </ul>
        <p>
          We may remove listings or suspend accounts that violate these terms or
          harm the marketplace.
        </p>
      </section>

      <section>
        <h2>4. Intellectual property</h2>
        <p>
          SolePrompt&apos;s branding, site design, and platform code are owned by
          us. Prompt content remains the property of its respective sellers,
          subject to licenses granted to buyers upon purchase.
        </p>
      </section>

      <section>
        <h2>5. Payments</h2>
        <p>
          Payments are handled by{" "}
          <a
            href="https://stripe.com/legal"
            target="_blank"
            rel="noopener noreferrer"
          >
            Stripe
          </a>
          . By making a purchase, you also agree to Stripe&apos;s terms. We do
          not store full payment card numbers on our servers.
        </p>
      </section>

      <section>
        <h2>6. X (Twitter) integration</h2>
        <p>
          SolePrompt offers an optional X integration for platform administrators
          only. This feature is not available to general marketplace users.
        </p>
        <ul>
          <li>
            An authorized admin may connect an X account through OAuth. Access
            tokens and secrets are stored securely on our servers.
          </li>
          <li>
            SolePrompt posts to X only when an admin explicitly approves or
            schedules a post. We do not send direct messages, auto-follow
            users, or engage in spam or unsolicited outreach.
          </li>
          <li>
            SolePrompt is not affiliated with, endorsed by, or sponsored by X
            Corp. X is a trademark of X Corp.
          </li>
          <li>
            Use of the X integration is also subject to{" "}
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
            .
          </li>
        </ul>
        <p>
          Admins may disconnect the X account at any time from the admin social
          settings panel.
        </p>
      </section>

      <section>
        <h2>7. Prohibited conduct</h2>
        <p>You may not:</p>
        <ul>
          <li>Violate laws or third-party rights</li>
          <li>Attempt to access accounts or data without authorization</li>
          <li>Scrape, reverse engineer, or disrupt the platform</li>
          <li>Upload malware, spam, or deceptive content</li>
          <li>Misuse OAuth integrations or connected social accounts</li>
        </ul>
      </section>

      <section>
        <h2>8. Disclaimers</h2>
        <p>
          SolePrompt is provided &ldquo;as is.&rdquo; We do not guarantee that
          prompts will produce specific results with any AI model. To the fullest
          extent permitted by law, we disclaim warranties and limit liability
          for indirect or consequential damages arising from use of the platform.
        </p>
      </section>

      <section>
        <h2>9. Changes</h2>
        <p>
          We may update these terms from time to time. Continued use after
          changes are posted constitutes acceptance of the revised terms.
        </p>
      </section>

      <section>
        <h2>10. Contact</h2>
        <p>
          Questions about these terms? Contact us through the platform or at
          the address listed on our{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
