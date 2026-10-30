import Link from 'next/link';
import { Sparkles, ArrowUpRight } from 'lucide-react';
export function PlusPreview({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="plus-feature-preview">
      <span className="plus-feature-icon">
        <Sparkles size={19} />
      </span>
      <div>
        <h3>{title}</h3>
        <p>{children}</p>
        <Link className="button button-outline" href="/pricing">
          Explore Plus <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
}
