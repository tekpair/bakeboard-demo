import Link from 'next/link';
import { Footer, MarketingHeader } from '@/components/marketing';

export const metadata = {
  title: 'Terms of Service',
  description:
    'Terms governing access to and use of the BakeBoard website and interactive demo.',
};

const sections = [
  ['acceptance', 'Acceptance of Terms'],
  ['description', 'Description of BakeBoard'],
  ['demo', 'Demo availability and limitations'],
  ['eligibility', 'Eligibility and authorized use'],
  ['responsibilities', 'Your responsibilities'],
  ['acceptable-use', 'Acceptable use'],
  ['intellectual-property', 'Intellectual property'],
  ['your-content', 'Your content'],
  ['feedback', 'Feedback and suggestions'],
  ['plans', 'Free and Plus plans'],
  ['availability', 'Service availability and changes'],
  ['restriction', 'Restriction of access'],
  ['privacy', 'Privacy and data handling'],
  ['third-parties', 'Third-party services and links'],
  ['disclaimers', 'Disclaimers'],
  ['liability', 'Limitation of liability'],
  ['indemnification', 'Indemnification'],
  ['disputes', 'Applicable law and disputes'],
  ['general', 'Severability and entire agreement'],
  ['changes', 'Changes to these Terms'],
  ['contact', 'Contact Us'],
] as const;

export default function TermsPage() {
  return (
    <>
      <MarketingHeader />
      <main id="main" className="privacy-page terms-page">
        <header className="privacy-header-band" id="terms-top">
          <div className="privacy-header wrap">
            <p className="eyebrow">BakeBoard</p>
            <h1>Terms of Service</h1>
            <p className="privacy-subtitle">
              Terms governing access to and use of BakeBoard.
            </p>
            <dl className="privacy-dates">
              <div>
                <dt>Effective date</dt>
                <dd>October 27, 2026</dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>October 27, 2026</dd>
              </div>
            </dl>
          </div>
        </header>

        <div className="privacy-reading wrap">
          <nav className="privacy-toc" aria-label="Terms of Service sections">
            <h2>On this page</h2>
            <ol>
              {sections.map(([id, title]) => (
                <li key={id}>
                  <a href={`#${id}`}>{title}</a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="privacy-content">
            <section id="acceptance">
              <h2>1. Acceptance of Terms</h2>
              <p>
                These Terms of Service (&ldquo;Terms&rdquo;) govern access to
                and use of the BakeBoard website (the &ldquo;Website&rdquo;) and
                its interactive demonstration (together, the
                &ldquo;Service&rdquo;). &ldquo;BakeBoard,&rdquo;
                &ldquo;we,&rdquo; and &ldquo;us&rdquo; refer to the operator of
                the Service; &ldquo;you&rdquo; refers to each visitor or person
                using it. By accessing or using the Service, you agree to these
                Terms to the extent permitted by applicable law. If you do not
                agree, please stop using the Service.
              </p>
              <p>
                The public demo does not currently require registration or an
                acceptance checkbox. Additional terms or an express acceptance
                step may apply if account-based services are introduced later;
                those terms will be presented when applicable.
              </p>
            </section>

            <section id="description">
              <h2>2. Description of BakeBoard</h2>
              <p>
                BakeBoard is designed to help bakeries organize production tasks
                and checklists, coordinate staff assignments, follow task
                progress, view schedules and deadlines, and manage related
                workspace information and preferences. It is a production and
                team management tool, not a customer ordering, checkout, or
                payment-processing service.
              </p>
              <p>
                At present, the Service is an interactive demo. Descriptions of
                planned features on the Website do not mean those features are
                available as production services.
              </p>
            </section>

            <section id="demo">
              <h2>3. Demo availability and limitations</h2>
              <p>
                The demo is provided for exploration and evaluation. Its sample
                workspaces, employees, roles, invitations, and plan controls are
                simulated. Business registration, individual employee sign-in,
                real invitation delivery, and paid subscriptions are not active.
                Demo role restrictions are a preview of possible permissions,
                not secure access controls.
              </p>
              <p>
                Supported changes are saved locally in your browser rather than
                in a BakeBoard account. They are not securely backed up or
                synchronized across devices. Resetting the demo, clearing
                browser data, changing browsers or devices, storage limits, or
                technical failures may cause those changes to be lost. We do not
                guarantee that demo data will be preserved.
              </p>
              <p>
                Do not enter sensitive, confidential, or real customer, staff,
                or business information into the public demo. The demo should
                not be relied on as the sole record for live bakery operations.
              </p>
            </section>

            <section id="eligibility">
              <h2>4. Eligibility and authorized use</h2>
              <p>
                BakeBoard is intended primarily for bakery businesses and people
                authorized to evaluate or work on their behalf. You must be
                legally able to agree to these Terms. If you use the Service for
                a business, you represent that you are authorized to do so on
                its behalf. The demo does not verify your age, identity,
                business, or authority.
              </p>
            </section>

            <section id="responsibilities">
              <h2>5. Your responsibilities</h2>
              <p>
                You are responsible for your use of the Service and information
                you choose to enter or send. Use it lawfully, provide accurate
                information where relevant, respect others&apos; rights and
                privacy, and obtain any permission needed before entering
                information about another person. Because this is a public demo,
                use sample information rather than confidential business records
                or personal information.
              </p>
            </section>

            <section id="acceptable-use">
              <h2>6. Acceptable use</h2>
              <p>
                You may not use the Service unlawfully; introduce malicious
                code; attempt unauthorized access to systems or information;
                interfere with the Website&apos;s operation or other
                visitors&apos; use; abuse or intentionally disrupt the demo;
                harass others or infringe their rights; or falsely claim to
                represent or be affiliated with BakeBoard. These restrictions do
                not prohibit lawful reviews, criticism, or other legally
                protected activity.
              </p>
            </section>

            <section id="intellectual-property">
              <h2>7. Intellectual property</h2>
              <p>
                The BakeBoard name, branding, logos, Website design, software,
                code, and original content are owned by BakeBoard or the
                applicable rights holders and are protected by applicable law.
                Subject to these Terms, you may access the Website and use the
                demo for its intended evaluation purpose. This permission does
                not transfer ownership of any BakeBoard materials or authorize
                their use beyond what is necessary to access the Service.
              </p>
            </section>

            <section id="your-content">
              <h2>8. Your content</h2>
              <p>
                You retain any rights you have in bakery names, logos, task
                details, checklists, staff information, and other materials you
                enter or upload. You are responsible for having the rights and
                permissions needed to provide them. Entering material into the
                demo does not give BakeBoard ownership of it.
              </p>
              <p>
                Demo entries, including uploaded bakery logos, are processed and
                stored in your browser as described in the{' '}
                <Link href="/privacy">Privacy Policy</Link>. This includes staff
                profile pictures. Information you send by email is handled
                separately from browser-stored demo entries.
              </p>
            </section>

            <section id="feedback">
              <h2>9. Feedback and suggestions</h2>
              <p>
                You may voluntarily send feedback or product suggestions by
                email. We may review and use them to develop, improve, and
                evaluate BakeBoard, subject to applicable law. Please do not
                include confidential information you do not wish to share for
                that purpose. Sending feedback does not transfer ownership of
                your other materials or require us to implement a suggestion.
              </p>
            </section>

            <section id="plans">
              <h2>10. Free and Plus plans</h2>
              <p>
                The Website describes proposed BakeBoard Free and BakeBoard Plus
                offerings. The Free preview includes a bakery workspace, a
                Production Board with task cards, a calendar, staff management,
                basic roles, and a product catalog. The Plus preview shows
                expanded workspace and team limits and features such as reusable
                checklists, workspace themes, and email reminder settings.
                Current descriptions and displayed prices are previews, not an
                offer of an active paid subscription or a guarantee of future
                features or pricing.
              </p>
              <p>
                You cannot purchase Plus or start a paid subscription through
                the current Service. If paid services become available,
                applicable billing, renewal, cancellation, and other
                subscription terms will be provided before purchase.
              </p>
            </section>

            <section id="availability">
              <h2>11. Service availability and changes</h2>
              <p>
                We may update, modify, suspend, or discontinue Website or demo
                features as the product develops, including to address errors,
                misuse, or security concerns. We do not promise uninterrupted
                access, a particular release date, or continued availability of
                any preview feature. This section does not limit rights you may
                have under applicable law.
              </p>
            </section>

            <section id="restriction">
              <h2>12. Restriction of access</h2>
              <p>
                We may restrict access to the public Website or demo when
                reasonably necessary to address misuse, a security threat, a
                legal obligation, or material violation of these Terms. This
                provision concerns the public demo; there are no production
                employee accounts to suspend under the current Service.
              </p>
            </section>

            <section id="privacy">
              <h2>13. Privacy and data handling</h2>
              <p>
                Our <Link href="/privacy">Privacy Policy</Link> explains how the
                Website and demo handle browser-stored information, email
                communications, technical requests, and related privacy choices.
                Please read it alongside these Terms.
              </p>
            </section>

            <section id="third-parties">
              <h2>14. Third-party services and links</h2>
              <p>
                The Website may link to sites or services operated by others.
                Those services are separate from BakeBoard and may have their
                own terms and privacy practices. Website hosting and email
                delivery also involve providers as described in the Privacy
                Policy. The current demo does not include third-party payment,
                account authentication, advertising, or analytics integrations.
              </p>
            </section>

            <section id="disclaimers">
              <h2>15. Disclaimers</h2>
              <p>
                To the extent permitted by applicable law, the Website and demo
                are provided &ldquo;as is&rdquo; and &ldquo;as available,&rdquo;
                without a promise that they will be uninterrupted, error-free,
                or suitable for live business operations. Demo calculations,
                reminders, status indicators, and other outputs should be
                checked independently before they are used for an operational
                decision. Nothing in these Terms excludes warranties or other
                protections that cannot lawfully be excluded.
              </p>
            </section>

            <section id="liability">
              <h2>16. Limitation of liability</h2>
              <p>
                To the extent permitted by applicable law, BakeBoard is not
                liable for indirect or consequential losses arising from use of
                the public demo, including losses associated with locally stored
                data being cleared, service interruptions, application errors,
                or reliance on demo outputs for business operations. This
                limitation does not apply where liability cannot lawfully be
                limited, including liability for fraud, willful misconduct, or
                other matters protected by applicable law.
              </p>
            </section>

            <section id="indemnification">
              <h2>17. Indemnification</h2>
              <p>
                To the extent permitted by applicable law, if your unlawful use
                of the Service or material breach of these Terms causes a
                third-party claim against BakeBoard, you agree to reimburse
                reasonable losses and costs directly resulting from that claim.
                This obligation applies only to the extent the claim is caused
                by your conduct and does not cover losses caused by
                BakeBoard&apos;s own misconduct or negligence.
              </p>
            </section>

            <section id="disputes">
              <h2>18. Applicable law and disputes</h2>
              <p>
                These Terms do not require arbitration or waive your right to
                participate in a class action. If a dispute arises, you may
                contact us first to seek an informal resolution. Any legal
                proceeding will be governed by the law applicable to the dispute
                and brought before a court with jurisdiction under that law.
                Nothing here limits rights or remedies that cannot be waived
                under applicable law.
              </p>
            </section>

            <section id="general">
              <h2>19. Severability and entire agreement</h2>
              <p>
                If a provision of these Terms is found unenforceable, the
                remaining provisions continue to apply to the extent permitted
                by law. These Terms constitute the agreement concerning access
                to the current Website and demo, except where a separate
                applicable agreement expressly says otherwise. The Privacy
                Policy provides additional information about data handling.
              </p>
            </section>

            <section id="changes">
              <h2>20. Changes to these Terms</h2>
              <p>
                We may revise these Terms as the Service changes. The updated
                version will be posted on this page with a revised date. Please
                review it when you use the Service. Changes apply from the
                stated effective date, subject to applicable law; they do not
                retroactively remove rights that the law protects. The current
                demo does not provide email notices of Terms changes.
              </p>
            </section>

            <section id="contact">
              <h2>21. Contact Us</h2>
              <p>
                If you have questions about these Terms of Service, please
                contact BakeBoard.
              </p>
              <p>
                <a href="mailto:hello@bakeboard.co?subject=BakeBoard%20Terms%20of%20Service">
                  hello@bakeboard.co
                </a>
              </p>
            </section>

            <a className="privacy-back-top" href="#terms-top">
              Back to top ↑
            </a>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
