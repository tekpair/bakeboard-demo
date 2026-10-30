'use client';
import Image from 'next/image';
import { useState } from 'react';
import { workspaceInitials } from '@/lib/workspace-settings';
export function WorkspaceAvatar({
  workspace,
  className = '',
}: {
  workspace: { name: string; logoDataUrl?: string };
  className?: string;
}) {
  const [failed, setFailed] = useState<string>();
  const showLogo = workspace.logoDataUrl && failed !== workspace.logoDataUrl;
  return (
    <span
      className={`workspace-avatar ${className}`}
      title={`${workspace.name} workspace`}
    >
      {showLogo ? (
        <Image
          width={104}
          height={104}
          unoptimized
          src={workspace.logoDataUrl!}
          alt={`${workspace.name} logo`}
          onError={() => setFailed(workspace.logoDataUrl)}
        />
      ) : (
        <span role="img" aria-label={`${workspace.name} initials`}>
          {workspaceInitials(workspace.name)}
        </span>
      )}
    </span>
  );
}
