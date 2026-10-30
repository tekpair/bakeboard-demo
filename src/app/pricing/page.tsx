import { Footer, MarketingHeader } from '@/components/marketing';
import { PricingPlans } from '@/components/pricing-plans';
export const metadata = {
  title: 'Pricing & Plans',
  description:
    'Explore BakeBoard Free and Plus plan previews for bakery production and team management. Paid subscriptions are not available in the demo.',
};
export default function PricingPage() {
  return (
    <>
      <MarketingHeader />
      <main id="main" className="pricing-page wrap">
        <p className="pricing-eyebrow">Simple, transparent pricing</p>
        <h1>Less chaos. More baking.</h1>
        <p className="section-description">
          Simple tools to keep your bakery organized, from your first order to
          your busiest season.
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
              q: 'Is the Free plan really free forever?',
              a: [
                "That's the plan! BakeBoard Free is designed to give smaller bakeries essential production and team management tools at no cost, with the option to upgrade to Plus for additional features.",
              ],
            },
            {
              q: "What's the difference between Free and Plus?",
              a: [
                'Free includes a bakery workspace, Production Board, unlimited task cards, calendar, team management, and custom products.',
                'Plus adds more workspaces, larger teams, additional Production Boards, reusable checklist templates, workspace personalization, and configurable email reminder settings.',
              ],
            },
            {
              q: 'Can I subscribe to BakeBoard Plus today?',
              id: 'subscription-availability',
              a: [
                'Not just yet! BakeBoard is currently an interactive demo. Business registration and paid subscriptions will become available in a future release.',
                "In the meantime, you're welcome to explore the demo and preview Plus features.",
              ],
            },
            {
              q: 'Does BakeBoard accept customer orders?',
              a: [
                "No. BakeBoard isn't an online ordering or checkout system.",
                "It's designed to help bakeries organize production tasks, coordinate employees, track progress, and stay on top of deadlines and pickups.",
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
