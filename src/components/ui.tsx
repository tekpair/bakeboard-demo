import Link from 'next/link';
import Image from 'next/image';
export { StaffAvatar as Avatar } from './staff-avatar';
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand ${light ? 'brand-light' : ''}`}
      aria-label="BakeBoard home"
    >
      <Image
        className="brand-horizontal"
        src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/brand/logo-horizontal${light ? '-light' : ''}.svg`}
        alt="BakeBoard"
        width={240}
        height={72}
      />
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
    </Link>
  );
}
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}
