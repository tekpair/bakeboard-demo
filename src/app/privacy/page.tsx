import Link from 'next/link';
import { Footer, MarketingHeader } from '@/components/marketing';

export const metadata = {
  title: 'Privacy Policy',
  description:
    'How the BakeBoard website and interactive demo handle information, browser storage, and privacy choices.',
};

const sections = [
  ['introduction', 'Introduction'],
  ['information', 'Information handled'],
  ['uses', 'How information is used'],
  ['demo-storage', 'Demo data and browser storage'],
  ['cookies', 'Cookies and similar technologies'],
  ['sharing', 'Information sharing'],
  ['retention', 'Retention and deletion'],
  ['security', 'Security'],
  ['choices', 'Your choices'],
  ['third-parties', 'Third-party services'],
  ['children', 'Children’s privacy'],
  ['changes', 'Changes to this policy'],
  ['contact', 'Contact'],
] as const;

export default function PrivacyPage() {
  return (
    <>
      <MarketingHeader />
      <main id="main" className="privacy-page">
        <header className="privacy-header-band" id="privacy-top">
          <div className="privacy-header wrap">
            <p className="eyebrow">BakeBoard</p>
            <h1>Privacy Policy</h1>
            <p className="privacy-subtitle">
              How BakeBoard handles information and respects your privacy.
            </p>
            <dl className="privacy-dates">
              <div>
                <dt>Effective date</dt>
                <dd>October 26, 2026</dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>October 26, 2026</dd>
              </div>
            </dl>
          </div>
        </header>

        <div className="privacy-reading wrap">
          <nav className="privacy-toc" aria-label="Privacy Policy sections">
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
            <section id="introduction">
              <h2>1. Introduction</h2>
              <p>
                BakeBoard is an internal bakery production and team management
                tool. This Privacy Policy explains how information is handled
                when you visit our website or use the interactive BakeBoard
                demo. The service is under development. Business accounts,
                employee sign-in, subscriptions, and online storage for bakery
                work are not available yet.
              </p>
              <p>
                The demo lets you explore production and team features without
                creating an account. The sections below explain what stays in
                your browser, what happens when you contact us, and the choices
                available to you.
              </p>
            </section>

            <section id="information">
              <h2>2. Information handled by the current demo</h2>
              <h3>Information you enter locally</h3>
              <p>
                You may enter bakery names and business contact details; staff
                names, roles, email addresses, and profile pictures; production
                tasks, checklists, notes, and customer references; product and
                template information; and demo preferences. If you upload a
                bakery logo, it is resized in your browser and the resulting
                image is saved with your other demo settings in browser storage.
                Staff profile pictures are also resized and saved in browser
                storage.
              </p>
              <p>
                BakeBoard provides sample bakery, staff, task, and activity
                records so you can try the demo. Any staff invitations you add
                are demo records kept in your browser; invitation emails are not
                sent.
              </p>
              <h3>Contact and technical information</h3>
              <p>
                If you email BakeBoard through a contact or feedback link, we
                receive the address, message, and any other information you
                choose to include. Your email provider and ours also process
                that message. When you visit the website, your browser sends
                ordinary request information to the hosting service so it can
                deliver the pages you request. The hosting service may keep
                technical access records under its own practices.
              </p>
              <p>
                BakeBoard does not ask you to create a password or enter payment
                details in the current demo. We do not use an analytics service
                in the current application.
              </p>
            </section>

            <section id="uses">
              <h2>3. How information is used</h2>
              <p>
                The demo uses information saved in your browser to remember
                changes, show production work and staff assignments, and display
                your workspace and preview preferences. We use emails you choose
                to send to read and respond to your questions or feedback.
              </p>
              <p>
                The hosting service processes website requests to deliver the
                pages you visit and support the operation of the site.
              </p>
            </section>

            <section id="demo-storage">
              <h2>4. Demo data and browser storage</h2>
              <p>
                BakeBoard saves demo changes in your browser&apos;s
                localStorage. This includes tasks and checklist progress, staff
                and pending invite records, staff profile pictures, workspace
                settings and logos, products and checklist templates, activity
                records, and your selected demo employee, role, and plan
                preview. Small storage entries also help the demo manage its
                sample data.
              </p>
              <p>
                Your changes may remain after a refresh, but they are tied to
                that browser and device. They are not saved to a BakeBoard
                account, backed up for you, or synchronized across devices.
                Private browsing, browser storage limits, clearing site data, or
                resetting the demo may remove them.
              </p>
              <p>
                <strong>
                  Please do not enter confidential customer, staff, or business
                  information into the public demo.
                </strong>{' '}
                Browser storage is not a secure production database, and the
                demo role controls are a frontend preview rather than secure
                access enforcement.
              </p>
            </section>

            <section id="cookies">
              <h2>5. Cookies and similar technologies</h2>
              <p>
                BakeBoard uses localStorage to remember demo activity and
                preferences. The current application does not set cookies for
                advertising or analytics. The service hosting the website may
                use technical storage needed to deliver it.
              </p>
              <p>
                You can manage localStorage and any cookies through your
                browser&apos;s site-data settings. We will update this policy if
                BakeBoard begins using additional cookies or similar
                technologies.
              </p>
            </section>

            <section id="sharing">
              <h2>6. Information sharing</h2>
              <p>
                Production and staff information you enter in the demo stays in
                your browser; the demo is not connected to an online BakeBoard
                database for that information. Our hosting service receives
                website requests to deliver pages. If you email us, the email
                providers involved in sending and receiving your message also
                process it.
              </p>
              <p>
                We do not use the current application to share demo entries with
                advertising or analytics services.
              </p>
            </section>

            <section id="retention">
              <h2>7. Data retention and deletion</h2>
              <p>
                Demo information may remain in your browser until it is
                overwritten, cleared, removed by the browser, or affected by
                Reset Demo. Reset Demo restores sample tasks, staff, library
                items, workspace settings, and activity; it may leave some demo
                preference or technical storage entries in place. To remove
                locally stored BakeBoard information more completely, clear this
                site&apos;s data in your browser.
              </p>
              <p>
                Resetting the demo or clearing browser storage does not delete
                email messages you have sent. Email providers and the website
                host may retain information under their own practices. You may
                contact us with questions about a message you sent.
              </p>
            </section>

            <section id="security">
              <h2>8. Security</h2>
              <p>
                The interactive demo stores supported changes in browser storage
                and uses simulated role permissions. It does not provide real
                account authentication or production-grade access controls for
                your entered data. Please use sample information and avoid
                confidential details. No internet-based service can guarantee
                absolute security.
              </p>
            </section>

            <section id="choices">
              <h2>9. Your privacy choices</h2>
              <p>
                You can reset the demo to its sample state or clear BakeBoard
                site data through your browser to remove locally stored changes.
                You can also choose whether to send an email through the contact
                and feedback links. There is no account deletion or data export
                feature in this demo because visitor accounts do not yet exist.
              </p>
              <p>
                Depending on where you live and which laws apply, you may have
                additional rights concerning information held by a website
                operator or its providers. For questions about information sent
                by email or other privacy concerns, use the contact details
                below.
              </p>
            </section>

            <section id="third-parties">
              <h2>10. Third-party services</h2>
              <p>
                The website relies on a hosting service to deliver pages. If you
                choose to email us, email providers handle your message. Those
                providers may have their own privacy terms. The current demo
                does not use third-party analytics, advertising, payment, or
                account authentication services.
              </p>
            </section>

            <section id="children">
              <h2>11. Children&apos;s privacy</h2>
              <p>
                BakeBoard is designed for bakery businesses and their teams, not
                for children. The demo does not include age verification. Please
                do not enter a child&apos;s personal information into the demo.
              </p>
            </section>

            <section id="changes">
              <h2>12. Changes to this policy</h2>
              <p>
                This policy may change as BakeBoard develops, particularly if
                accounts, backend storage, subscriptions, analytics, or other
                services are introduced. The date at the top will be updated
                when a revised policy is published. The current demo does not
                provide email notifications about policy changes.
              </p>
            </section>

            <section id="contact">
              <h2>Privacy Questions?</h2>
              <p>
                If you have questions about this Privacy Policy or how BakeBoard
                handles information, please contact us.
              </p>
              <p>
                <a href="mailto:hello@bakeboard.co?subject=BakeBoard%20privacy%20question">
                  hello@bakeboard.co
                </a>
              </p>
              <p>
                For more information about the current demo, see our{' '}
                <Link href="/terms">Terms of Service</Link>.
              </p>
            </section>

            <a className="privacy-back-top" href="#privacy-top">
              Back to top ↑
            </a>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
