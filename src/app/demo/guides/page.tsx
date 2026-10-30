'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function GuidesPage() {
  const router = useRouter();
  useEffect(() => router.replace('/help'), [router]);
  return <main id="main"><p>Guides are in the <Link href="/help">Help Center</Link>.</p></main>;
}
