import { MarketingHeader, Footer } from '@/components/marketing';
import { PricingPlans } from '@/components/pricing-plans';
import { MarketingImageSlot } from '@/components/marketing-image-slot';
import Image from 'next/image';
import Link from 'next/link';
import {
  Check,
  ClipboardList,
  UsersRound,
  CircleCheck,
  CalendarDays,
  LibraryBig,
  ListChecks,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <MarketingHeader />
      <main id="main" className="home-page">
        <section className="home-hero-band">
          <div className="home-hero wrap">
            <div className="home-hero-copy">
              <p className="home-pill">
                <Sparkles size={16} aria-hidden="true" /> Built for the work
                behind the bakes
              </p>
              <h1>
                Less chaos.
                <br />
                <em>More baking.</em>
              </h1>
              <p className="home-lead">
                Your customer orders, production tasks, and staff—all on the
                same page.
              </p>
              <p className="home-hero-description">
                Turn the details in your notebook into a shared plan. Know what
                needs to be made, who’s on it, and when it needs to be ready.
              </p>
              <div className="home-actions">
                <Link className="button button-primary" href="/demo/overview">
                  Try Free Demo
                </Link>
                <Link className="button button-outline" href="#features">
                  Meet BakeBoard
                </Link>
              </div>
              <p className="home-demo-note">
                <CircleCheck size={15} aria-hidden="true" />
                No signup. No credit card. Explore at your pace.
              </p>
            </div>
            <div className="home-hero-product">
              <MarketingImageSlot kind="board" />
              <div className="home-hero-sticker">
                <ListChecks size={23} aria-hidden="true" />
                <span>
                  <strong>A plan everyone can follow.</strong>
                  <small>From the first mix to the final handoff.</small>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="home-features">
          <div className="home-section-intro wrap">
            <p className="eyebrow">A little clarity goes a long way</p>
            <h2>
              All the details.
              <br />A lot less back-and-forth.
            </h2>
            <p>
              BakeBoard bridges the gap between physical notes and a production
              plan your whole staff can use.
            </p>
          </div>
          <div className="home-benefit-grid wrap">
            {[
              {
                Icon: ClipboardList,
                title: 'See the whole picture',
                text: 'Follow customer production and daily prep from To Do through In Progress, Ready, and Completed.',
                label: 'Production Board',
              },
              {
                Icon: LibraryBig,
                title: 'Keep your details close',
                text: 'Organize products and categories, with reusable production checklist templates in Plus.',
                label: 'Production Library',
              },
              {
                Icon: UsersRound,
                title: "Everyone get's a next step",
                text: 'Assign work, follow checklist progress, and let each staff member focus on their own task list.',
                label: 'My Tasks',
              },
            ].map(({ Icon, title, text, label }) => (
              <article key={title}>
                <span className="home-benefit-icon">
                  <Icon size={26} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <p className="eyebrow">{label}</p>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-feature-band home-feature-tinted">
          <div className="home-feature-row wrap">
            <MarketingImageSlot kind="calendar" />
            <div className="home-feature-copy">
              <p className="home-pill">
                <CalendarDays size={16} aria-hidden="true" />
                Production Calendar
              </p>
              <h2>
                A busy week.
                <br />A clear plan.
              </h2>
              <p>
                Bring production deadlines and pickup times into one calendar.
                Look ahead, plan the day, and keep those “is that due today?”
                moments to a minimum.
              </p>
              <ul>
                {[
                  'Day, Week, and Month views',
                  'Production deadlines and pickups together',
                  'Connected to your task cards',
                ].map((t) => (
                  <li key={t}>
                    <Check size={19} aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        <section className="home-feature-band">
          <div className="home-feature-row home-feature-reverse wrap">
            <MarketingImageSlot kind="details" />
            <div className="home-feature-copy">
              <p className="home-pill">
                <ListChecks size={16} aria-hidden="true" />
                Task Details
              </p>
              <h2>
                Fewer loose notes.
                <br />
                Better handoffs.
              </h2>
              <p>
                Keep quantities, production instructions, and finishing details
                with each task. Make allergy notes easy to spot and help the
                next person pick up where you left off.
              </p>
              <ul>
                {[
                  'Prominent allergy and handling notes',
                  'Shared production checklists',
                  'Clear staff assignments and progress',
                ].map((t) => (
                  <li key={t}>
                    <Check size={19} aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="home-workflow-band">
          <div className="wrap">
            <div className="home-section-intro">
              <p className="eyebrow">Simple enough for a busy bakery</p>
              <h2>From task to done.</h2>
              <p>Less time explaining the plan. More time making it happen.</p>
            </div>
            <ol className="home-workflow">
              {[
                {
                  Icon: ClipboardList,
                  title: 'Create the task',
                  text: 'Add what needs to be made, when it’s due, and the details that matter.',
                },
                {
                  Icon: UsersRound,
                  title: 'Share the work',
                  text: 'Choose who’s responsible and add checklist steps to keep things on track.',
                },
                {
                  Icon: CircleCheck,
                  title: 'Follow it through',
                  text: 'Keep progress visible from To Do to In Progress, Ready, and Completed.',
                },
              ].map(({ Icon, title, text }) => (
                <li key={title}>
                  <Icon size={29} strokeWidth={1.7} aria-hidden="true" />
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
              <p className="eyebrow">Room for your bakery to grow</p>
              <h2>
                Small price.
                <br />A more organized day.
              </h2>
              <p>
                One workspace per subscription. Pick the right fit for your
                staff, and explore both plans in the free demo.
              </p>
            </div>
            <PricingPlans compact />
          </div>
        </section>
        <section className="home-closing-band">
          <div className="home-closing wrap">
            <Image
              src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/brand/logo-standalone.svg`}
              alt=""
              width={170}
              height={170}
            />
            <div>
              <p className="eyebrow">Your next batch of better days</p>
              <h2>
                Let’s get your bakery
                <br />
                on the same page.
              </h2>
              <p>
                Take BakeBoard for a spin. Your first step is just a look
                around.
              </p>
              <Link className="button button-primary" href="/demo/overview">
                Try Free Demo
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
