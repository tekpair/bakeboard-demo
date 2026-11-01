import { Footer, MarketingHeader } from '@/components/marketing';
import { PricingPlans } from '@/components/pricing-plans';
export const metadata = {
  title: 'Pricing & Plans',
  description:
    'Preview BakeBoard Starter and Plus pricing for bakery production and customer order tracking. Paid subscriptions are not available in the demo.',
};
export default function PricingPage() {
  return (
    <>
      <MarketingHeader />
      <main id="main" className="pricing-page wrap">
        <p className="pricing-eyebrow">Simple, transparent pricing</p>
        <h1>Less chaos. More baking.</h1>
        <p className="section-description">
          Track customer orders and production work together, from your first
          busy day to your busiest season.
        </p>
        <PricingPlans />
        <section className="pricing-faq">
          <h2>Frequently asked questions</h2>
          {[
            {
              q: 'Can I try BakeBoard without signing up?',
              a: [
                'Absolutely! Explore BakeBoard with a sample bakery workspace, production tasks, calendar, and team. No account or credit card required.',
              ],
            },
            {
              q: 'Does Starter include a free trial?',
              a: [
                'A 14-day free trial is planned for BakeBoard Starter at launch. The current interactive demo is free to explore and does not start a trial or subscription.',
              ],
            },
            {
              q: "What's the difference between Starter and Plus?",
              a: [
                'Starter includes one bakery workspace, up to three staff members, a Production Board with unlimited task cards, a calendar, staff management, and custom products.',
                'Plus keeps the one-workspace limit and adds a larger team limit, a second Production Board, reusable checklist templates, workspace themes, and email reminder settings.',
              ],
            },
            {
              q: 'Can I subscribe to BakeBoard today?',
              id: 'subscription-availability',
              a: [
                'Not yet. BakeBoard is currently an interactive demo. The displayed Starter and Plus prices are planned launch options; no paid subscription or Starter trial can be started here today.',
                'You can explore the demo and switch between Starter and Plus previews without an account or credit card.',
              ],
            },
            {
              q: 'Can customers place orders or pay through BakeBoard?',
              a: [
                'No. BakeBoard does not take customer orders, provide checkout, or accept payments.',
                'Bakery owners and staff can record and track customer orders they received elsewhere, organize the production work, and keep deadlines and pickups visible.',
              ],
            },
            {
              q: 'Can my staff belong to more than one bakery?',
              a: [
                'Each subscription is planned to cover one bakery workspace. When individual staff accounts launch, a staff member may belong to multiple bakeries through separate workspace memberships.',
                'Individual accounts and cross-bakery membership are not available in the current demo.',
              ],
            },
            {
              q: 'Can I add my bakery employees to BakeBoard?',
              a: [
                'In the demo, you can explore team management, assign tasks, and preview different employee roles.',
                'Real employee invitations and individual staff accounts will become available when BakeBoard officially launches.',
              ],
            },
            {
              q: 'Will my changes be saved in the demo?',
              a: [
                'The demo can save changes locally in your browser, allowing you to explore its features.',
                "However, demo information isn't backed up to a personal BakeBoard account or synchronized across devices. Clearing your browser data or resetting the demo may remove your changes.",
              ],
            },
            {
              q: 'Who is BakeBoard designed for?',
              a: [
                'BakeBoard is built for bakeries of all sizes, from small teams managing daily production to growing bakeries coordinating multiple employees and workflows.',
                "Whether you're preparing custom cakes, decorating cookies, or organizing daily pastry production, BakeBoard helps keep everyone on the same page.",
              ],
            },
          ].map((f) => (
            <details
              key={f.q}
              id={'id' in f ? f.id : undefined}
              name="pricing-faq"
            >
              <summary>{f.q}</summary>
              <div className="pricing-faq-answer">
                {f.a.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </details>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
