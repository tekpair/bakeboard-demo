import Image from 'next/image';
import { overviewImages } from '@/lib/marketing-images';

export function OverviewDevices() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return (
    <figure
      className="overview-devices"
      aria-label="BakeBoard Overview on a computer and phone"
    >
      <div className="overview-computer">
        <div className="overview-computer-frame">
          <div className="overview-computer-display">
            <Image
              src={`${basePath}${overviewImages.desktop}`}
              alt="BakeBoard’s desktop Overview, showing the production summary, staff navigation, pickups, and recent activity"
              width={1440}
              height={900}
              sizes="(max-width: 800px) 85vw, 49vw"
              preload
            />
          </div>
          <div className="overview-computer-chin" />
        </div>
        <div className="overview-computer-neck" />
        <div className="overview-computer-base" />
      </div>
      <div className="overview-phone">
        <div className="overview-phone-display">
          <Image
            src={`${basePath}${overviewImages.mobile}`}
            alt="The same BakeBoard Overview in its mobile layout, with task counts and pickup alerts"
            width={375}
            height={844}
            sizes="(max-width: 800px) 26vw, 15vw"
            preload
          />
        </div>
      </div>
    </figure>
  );
}
