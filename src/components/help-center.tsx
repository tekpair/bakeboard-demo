'use client';

import { useState } from 'react';
import { ArrowRight, BookOpen, Search } from 'lucide-react';
import { starterGuides } from '@/lib/help-guides';

function inlineEmphasis(text: string) {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, index) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={index}>{part.slice(2, -2)}</strong>
      ) : (
        part
      ),
    );
}

export function HelpCenter() {
  const guides = starterGuides.filter((guide) => guide.published);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All topics');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const categories = [
    'All topics',
    ...new Set(guides.map((guide) => guide.category)),
  ];
  const matching = guides.filter(
    (guide) =>
      (category === 'All topics' || guide.category === category) &&
      `${guide.title} ${guide.summary} ${guide.content}`
        .toLocaleLowerCase()
        .includes(query.trim().toLocaleLowerCase()),
  );
  const selected = matching.find((guide) => guide.id === selectedId);

  return (
    <main id="main" className="help-page">
      <section className="help-hero-band">
        <div className="help-hero wrap">
          <p className="eyebrow">BakeBoard guides</p>
          <h1>How can we help?</h1>
          <p>
            Find practical guides for planning production, coordinating your
            team, and keeping the day moving.
          </p>
          <label className="help-search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              aria-label="Search help guides"
              placeholder="Search guides"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelectedId(null);
              }}
            />
          </label>
        </div>
      </section>
      <section className="help-content wrap" aria-label="Help guides">
        <div className="help-content-heading">
          <div>
            <p className="eyebrow">Browse the library</p>
            <h2>Guides</h2>
          </div>
        </div>
        {categories.length > 2 && (
          <div className="help-topics" role="group" aria-label="Guide topics">
            {categories.map((topic) => (
              <button
                key={topic}
                type="button"
                aria-pressed={category === topic}
                onClick={() => {
                  setCategory(topic);
                  setSelectedId(null);
                }}
              >
                {topic}
              </button>
            ))}
          </div>
        )}
        {matching.length ? (
          selected ? (
            <article className="help-article">
              <button
                type="button"
                className="help-back"
                onClick={() => setSelectedId(null)}
              >
                ← All guides
              </button>
              <p className="eyebrow">{selected.category}</p>
              <h2>{selected.title}</h2>
              <p className="help-article-summary">{selected.summary}</p>
              {selected.content
                .split(/\n\s*\n/)
                .filter(Boolean)
                .map((paragraph, index) => {
                  const section = /^###\s+(.+)$/.exec(paragraph.trim());
                  const subheading = /^\*\*([^*]+)\*\*$/.exec(paragraph.trim());
                  return section ? (
                    <h3 key={index}>{section[1]}</h3>
                  ) : subheading ? (
                    <h4 key={index}>{subheading[1]}</h4>
                  ) : (
                    <p key={index}>{inlineEmphasis(paragraph)}</p>
                  );
                })}
            </article>
          ) : (
            <div className="help-guide-grid">
              {matching.map((guide) => (
                <button
                  key={guide.id}
                  type="button"
                  className="help-guide-card"
                  onClick={() => setSelectedId(guide.id)}
                >
                  <span className="help-guide-icon">
                    <BookOpen size={19} aria-hidden="true" />
                  </span>
                  <span className="eyebrow">{guide.category}</span>
                  <strong>{guide.title}</strong>
                  <span>{guide.summary}</span>
                  <span className="help-card-link">
                    Read guide <ArrowRight size={15} aria-hidden="true" />
                  </span>
                </button>
              ))}
            </div>
          )
        ) : (
          <div className="help-empty" role="status">
            <span className="help-empty-icon">
              <Search size={20} aria-hidden="true" />
            </span>
            <div className="help-empty-copy">
              <h2>Nothing matches your search</h2>
              <p>Try a different term or browse all guides.</p>
            </div>
            <button
              type="button"
              className="button button-outline"
              onClick={() => {
                setQuery('');
                setCategory('All topics');
              }}
            >
              Show all guides
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
