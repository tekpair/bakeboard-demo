import Link from 'next/link';
import { ArrowUpRight, Wheat } from 'lucide-react';
export { StaffAvatar as Avatar } from './staff-avatar';
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand ${light ? 'brand-light' : ''}`}
      aria-label="BakeBoard home"
    >
      <span className="brand-icon">
        <Wheat size={23} strokeWidth={1.7} />
      </span>
      BakeBoard
    </Link>
  );
}
export function DemoLink({
  children = 'Try Free Demo',
  className = '',
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      className={`button button-primary ${className}`}
      href="/demo/overview"
    >
      {children}
      <ArrowUpRight size={16} />
    </Link>
  );
}
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}
