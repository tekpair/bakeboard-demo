import Image from 'next/image';
import { marketingImages } from '@/lib/marketing-images';

export function MarketingImageSlot({
  kind,
}: {
  kind: keyof typeof marketingImages;
}) {
  const { src, alt } = marketingImages[kind];
  return (
    <div
      className="marketing-image-slot"
      data-image-slot={kind}
      aria-hidden={!src || undefined}
    >
      {src && (
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}${src}`}
          alt={alt}
          width={1200}
          height={800}
          sizes="(max-width: 800px) 100vw, 55vw"
        />
      )}
    </div>
  );
}
