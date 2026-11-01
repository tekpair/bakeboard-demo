import { ArrowUpRight } from 'lucide-react';
import { Footer, MarketingHeader } from '@/components/marketing';
import { DemoLink } from '@/components/ui';

export const metadata = {
  title: 'About Us',
  description:
    'Learn why BakeBoard is being built for bakery production and team management.',
};

export default function AboutPage() {
  return (
    <>
      <MarketingHeader />
      <main id="main" className="about-page">
        <section className="about-hero-band">
          <div className="about-hero wrap">
            <p className="eyebrow">A little about BakeBoard.</p>
            <h1>
              Built with bakeries in mind.
              <br />
              <em>Inspired by life behind the counter.</em>
            </h1>
            <div className="about-hero-copy">
              <p>Running a bakery involves a lot more than baking.</p>
              <p>
                Behind every finished cake, decorated cookie, and freshly
                stocked pastry case is a whole lot of planning, preparation,
                teamwork, and probably a few last-minute surprises.
              </p>
              <p>That&apos;s where the idea for BakeBoard began.</p>
            </div>
          </div>
        </section>

        <section className="about-story-band">
          <div className="about-section wrap">
            <div className="about-section-heading">
              <p className="eyebrow">The story</p>
              <h2>Inspired by a real bakery.</h2>
            </div>
            <div className="about-section-copy">
              <p>
                The idea for BakeBoard started close to home—at Sweet Elevation
                Bakery, a family-owned bakery in New York&apos;s Capital Region.
              </p>
              <p>
                As the son of the bakery&apos;s owner, BakeBoard&apos;s creator
                saw how much planning, coordination, and behind-the-scenes work
                goes into keeping a bakery running.
              </p>
              <p>
                From juggling production tasks and coordinating employees to
                keeping track of deadlines and everything in between, bakery
                life can get complicated pretty quickly.
              </p>
              <p>
                The goal was simple: create something that makes the
                behind-the-scenes work a little easier.
              </p>
              <p>
                Not another complicated system to learn. Just a straightforward
                way to keep everyone organized and on the same page.
              </p>
            </div>
          </div>
        </section>

        <section className="about-purpose-band">
          <div className="about-section wrap">
            <div className="about-section-heading">
              <p className="eyebrow">Why it exists</p>
              <h2>Less chaos. More baking.</h2>
            </div>
            <div className="about-section-copy">
              <p>
                BakeBoard is designed to bring customer order tracking and daily
                bakery production together in one place.
              </p>
              <p>
                Record the details of orders your bakery has already received,
                assign production work to your team, follow progress, and stay
                ahead of deadlines and pickups.
              </p>
              <p>
                Whether you&apos;re a small bakery with a few employees or a
                growing operation with multiple people handling production,
                BakeBoard is being built to help make the workday run a little
                smoother.
              </p>
              <p>Because running a bakery is already enough work.</p>
              <div className="about-difference">
                <h3>Made for the work behind the bakes.</h3>
                <p>
                  A shared view of customer order details, prep, decorating, and
                  handoffs, shaped around how bakery teams actually work.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="about-future-band">
          <div className="about-section wrap">
            <div className="about-section-heading">
              <p className="eyebrow">What comes next</p>
              <h2>We&apos;re just getting started.</h2>
            </div>
            <div className="about-section-copy">
              <p>
                BakeBoard is currently in its demo stage, and we&apos;re
                continuing to develop and improve it.
              </p>
              <p>
                We believe the best tools are shaped by the people who actually
                use them. That&apos;s why feedback from bakery owners, bakers,
                decorators, and production teams matters to us.
              </p>
            </div>
          </div>
        </section>

        <section className="about-invitation-band">
          <div className="about-invitation wrap">
            <p className="eyebrow">Help shape BakeBoard</p>
            <h2>What would make your bakery&apos;s day easier?</h2>
            <p>We&apos;d love to hear your ideas.</p>
            <div className="about-actions">
              <DemoLink>Try Free Demo</DemoLink>
              <a
                className="button button-outline"
                href="mailto:hello@bakeboard.co?subject=BakeBoard%20feedback&body=What%20would%20make%20your%20bakery%27s%20day%20easier%3F%0A%0A"
              >
                Share Your Feedback <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
