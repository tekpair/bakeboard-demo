import { HelpCenter } from '@/components/help-center';
import { Footer, MarketingHeader } from '@/components/marketing';

export const metadata = {
  title: 'Help Center',
  description:
    'Browse BakeBoard guides for production tasks, team coordination, and planning your bakery work.',
};

export default function HelpPage() {
  return (
    <>
      <MarketingHeader />
      <HelpCenter />
      <Footer />
    </>
  );
}
