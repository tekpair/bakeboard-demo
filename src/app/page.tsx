import { MarketingHeader, Footer } from '@/components/marketing';
import { PricingPlans } from '@/components/pricing-plans';
import { ProductPreview } from '@/components/product-preview';
import Link from 'next/link';
import Image from 'next/image';
import {
  Check,
  ClipboardList,
  UsersRound,
  CircleCheck,
  Wheat,
} from 'lucide-react';

const features = [
  {
    label: 'Production Board',
    title: 'Every task. Every handoff. One shared view.',
    description:
      'Turn the orders in your notebook and your everyday bakery prep into a clear production plan. See what needs doing and keep work moving from To Do to Completed.',
    benefits: [
      'Customer production and daily prep together',
      'Clear statuses, staff assignments, and checklists',
      'Order details recorded from wherever you receive them',
    ],
    preview: 'board' as const,
  },
  {
    label: 'Production Calendar',
    title: 'Know what’s due before the day gets busy.',
    description:
      'Bring production deadlines and pickup times into the same calendar. Plan the week ahead or focus on today without searching through messages and paper notes.',
    benefits: [
      'Day, Week, and Month views',
      'Production deadlines and pickup times',
      'One schedule connected to your task cards',
    ],
    preview: 'calendar' as const,
  },
  {
    label: 'Task Details & My Tasks',
    title: 'The right details, in the right hands.',
    description:
      'Keep quantities, finishing instructions, and allergy notes with the work. Assign your staff and give each person a focused view of what they’re responsible for.',
    benefits: [
      'Production instructions and allergy notes',
      'Checklist progress everyone can follow',
      'A personal task view for each staff member',
    ],
    preview: 'details' as const,
  },
];

export default function HomePage() {
  return (
    <>
      <MarketingHeader />
      <main id="main" className="home-page">
        <section className="home-hero-band">
          <div className="home-hero wrap">
            <div className="home-hero-copy">
              <p className="home-pill">
                <Wheat size={15} aria-hidden="true" /> Inspired by life behind
                the bakery counter
              </p>
              <h1>
                Your orders.
                <br />
                Your production.
                <br />
                <em>One clear plan.</em>
              </h1>
              <p className="home-lead">
                Production and customer order tracking, built for bakeries.
                Bring the details from your notes into one shared workspace, so
                your staff knows what’s next.
              </p>
              <div className="home-actions">
                <Link className="button button-primary" href="/demo/overview">
                  Try Free Demo
                </Link>
                <Link className="button button-outline" href="#features">
                  Explore the features
                </Link>
              </div>
              <p className="home-demo-note">
                Interactive demo. No signup or credit card needed.
              </p>
            </div>
            <figure className="home-hero-visual">
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/production-board-hero.png`}
                alt="BakeBoard’s demo Production Board displayed on a laptop at a bakery worktop"
                width={1710}
                height={919}
                sizes="(max-width: 800px) 100vw, 55vw"
                preload
              />
              <figcaption>
                <span className="home-visual-icon">
                  <UsersRound size={20} aria-hidden="true" />
                </span>
                <span>
                  <strong>Less chasing updates.</strong>
                  <span>More time for the work you love.</span>
                </span>
              </figcaption>
            </figure>
          </div>
          <dl className="home-facts wrap">
            <div>
              <dt>Built for bakeries</dt>
              <dd>Production & customer order tracking</dd>
            </div>
            <div>
              <dt>One shared workspace</dt>
              <dd>Your staff, tasks, and schedule together</dd>
            </div>
            <div>
              <dt>From $3.99 / month</dt>
              <dd>Starter pricing planned for launch</dd>
            </div>
            <div>
              <dt>Try it at your pace</dt>
              <dd>Explore and reset the free demo anytime</dd>
            </div>
          </dl>
        </section>
        <section id="features" className="home-features">
          <div className="home-section-intro wrap">
            <p className="eyebrow">Made for the work behind the bakes</p>
            <h2>
              From paper notes to
              <br />a plan everyone can follow.
            </h2>
            <p>
              Keep track of the customer orders you receive elsewhere and the
              production work behind them. BakeBoard brings the moving parts
              together.
            </p>
          </div>
          {features.map((feature, index) => (
            <div
              className={`home-feature-band ${index === 1 ? 'home-feature-tinted' : ''}`}
              key={feature.preview}
            >
              <article
                className={`home-feature-row wrap ${index % 2 ? 'home-feature-reverse' : ''}`}
              >
                <ProductPreview kind={feature.preview} />
                <div className="home-feature-copy">
                  <p className="home-pill">{feature.label}</p>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <ul>
                    {feature.benefits.map((benefit) => (
                      <li key={benefit}>
                        <Check size={19} aria-hidden="true" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </div>
          ))}
          <div className="home-purpose-note wrap">
            <ClipboardList size={21} aria-hidden="true" />
            <p>
              <strong>Track the orders you already have.</strong> BakeBoard
              helps your staff organize the work behind them. Customers place
              orders and make payments through your existing channels.
            </p>
          </div>
        </section>
        <section id="how-it-works" className="home-workflow-band">
          <div className="wrap">
            <div className="home-section-intro">
              <p className="eyebrow">Easy to pick up</p>
              <h2>From task to done.</h2>
            </div>
            <ol className="home-workflow">
              {[
                {
                  Icon: ClipboardList,
                  title: 'Create a task',
                  text: 'Add what needs to be made, when it’s due, and the details that matter.',
                },
                {
                  Icon: UsersRound,
                  title: 'Assign the work',
                  text: 'Choose who’s responsible and add checklist steps to keep everything on track.',
                },
                {
                  Icon: CircleCheck,
                  title: 'Follow the progress',
                  text: 'Move from To Do to In Progress, Ready, and Completed, with everyone in the loop.',
                },
              ].map(({ Icon, title, text }) => (
                <li key={title}>
                  <Icon size={24} strokeWidth={1.6} aria-hidden="true" />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section className="pricing-band">
          <div className="home-pricing">
            <div className="home-section-intro">
              <p className="eyebrow">A little more organized, every day</p>
              <h2>Simple plans for your bakery.</h2>
              <p>
                One workspace per subscription. Start with the essentials or
                make room for a growing staff with Plus.
              </p>
            </div>
            <PricingPlans compact />
          </div>
        </section>
        <section className="home-closing wrap">
          <div>
            <p className="eyebrow">Take a look around</p>
            <h2>A calmer workday starts here.</h2>
            <p>
              Try BakeBoard’s interactive demo and see how it could fit your
              bakery.
            </p>
          </div>
          <Link href="/demo/overview" className="button button-primary">
            Try Free Demo
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
