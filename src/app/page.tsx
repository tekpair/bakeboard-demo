import { MarketingHeader, Footer } from '@/components/marketing';
import { DemoLink } from '@/components/ui';
import { PricingPlans } from '@/components/pricing-plans';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowDownRight,
  ClipboardCheck,
  Clock3,
  MessageCircleMore,
  UsersRound,
} from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <MarketingHeader />
      <main id="main">
        <section className="hero-band">
          <div className="hero wrap">
            <div className="hero-copy">
              <h1>
                Your bakery.
                <br />
                <em>Beautifully</em> organized.
              </h1>
              <p>
                A free, easy-to-use production board built for everyday bakers.
                Everyone knows what needs to get done, who&apos;s responsible,
                and what&apos;s coming next.
              </p>
              <div className="hero-actions">
                <DemoLink />
                <Link className="button button-outline" href="#how-it-works">
                  See How It Works <ArrowDownRight size={15} />
                </Link>
              </div>
              <p className="hero-reassurance">
                No signup. No credit card. Just explore.
              </p>
            </div>
            <figure className="hero-photo-slot">
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/production-board-hero.png`}
                alt="Illustrative bakery scene with the BakeBoard demo Production Board displayed on a laptop"
                width={1710}
                height={919}
                priority
              />
            </figure>
          </div>
        </section>

        <section className="familiar-band">
          <div className="familiar-section wrap">
            <div>
              <p className="eyebrow">A familiar kind of busy</p>
              <h2>Sound familiar?</h2>
            </div>
            <div className="familiar-copy">
              <ul>
                <li>Orders scattered across messages.</li>
                <li>Sticky notes everywhere.</li>
                <li>Someone asking what still needs decorating.</li>
                <li>A pickup time sneaking up on you.</li>
              </ul>
              <p>
                BakeBoard brings the day’s work together so everyone knows what
                needs to happen next.
              </p>
            </div>
          </div>
        </section>

        <section className="benefits-band">
          <div id="features" className="features-section wrap">
            <div className="features-intro">
              <p className="eyebrow">A calmer way to run the day</p>
              <h2>
                Fewer forgotten details.
                <br />
                Clearer handoffs.
              </h2>
              <p>
                Give everyone one clear picture of what’s happening, so you can
                spend less time chasing updates and more time baking.
              </p>
            </div>
            <div className="feature-list">
              {[
                {
                  title: 'Nothing slips through',
                  Icon: ClipboardCheck,
                  text: "Keep production instructions, checklists, and finishing details together so important information doesn't get lost.",
                },
                {
                  title: 'Everyone knows the next step',
                  Icon: UsersRound,
                  text: "Assign tasks to your staff and see exactly who's responsible, what's in progress, and what still needs attention.",
                },
                {
                  title: 'A calmer pickup rush',
                  Icon: Clock3,
                  text: "Keep upcoming deadlines and pickup times in view, so your team knows what's ready and what needs finishing.",
                },
                {
                  title: 'One shared view, start to finish',
                  Icon: MessageCircleMore,
                  text: 'Follow production from preparation to decorating, packaging, and completion—all in one organized workspace.',
                },
              ].map((feature) => (
                <article key={feature.title}>
                  <feature.Icon
                    className="feature-icon"
                    size={18}
                    aria-hidden="true"
                  />
                  <div>
                    <h3>{feature.title}</h3>
                    <p>{feature.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="how-band">
          <div id="how-it-works" className="how-section wrap">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Easy to pick up</p>
                <h2>From task to done.</h2>
              </div>
            </div>
            <ol className="steps">
              {[
                {
                  title: 'Create a task',
                  text: "Add what needs to be made, when it's due, and any important production instructions.",
                },
                {
                  title: 'Assign the work',
                  text: "Choose who's responsible and add checklist steps to keep everything on track.",
                },
                {
                  title: 'Follow the progress',
                  text: 'Track each task from To Do through In Progress, Ready, and Completed.',
                },
              ].map((step, index) => (
                <li key={step.title}>
                  <span className="step-number">{index + 1}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="pricing-band">
          <div className="home-pricing">
            <div className="section-heading">
              <h2>Start with the essentials.</h2>
            </div>
            <PricingPlans compact />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
