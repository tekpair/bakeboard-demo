'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { StaffReference } from '@/lib/types';

export function StaffAvatar({
  employee,
  small = false,
  className = '',
}: {
  employee: StaffReference;
  small?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState<string>();
  const photo = employee.photoDataUrl;
  const label = `${employee.name}${employee.removed ? ' · Removed staff' : employee.active === false ? ' · Inactive' : ''}`;
  return (
    <span
      title={label}
      aria-label={label}
      className={`avatar ${employee.color} ${small ? 'avatar-small' : ''} ${className}`}
    >
      {photo && failed !== photo ? (
        <Image
          src={photo}
          width={256}
          height={256}
          unoptimized
          alt=""
          onError={() => setFailed(photo)}
        />
      ) : (
        employee.initials
      )}
    </span>
  );
}
