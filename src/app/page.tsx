'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LandingPage } from '@/components/pages/LandingPage';
import { PublicHomePage } from '@/components/pages/PublicHomePage';
import { LoadingSkeleton } from '@/components/ui/LoadingSpinner';

function HomeContent() {
  const searchParams = useSearchParams();
  const showCMSLanding = searchParams.get('cms') === 'true';
  
  // Show CMS product landing page if ?cms=true, otherwise show public content homepage
  if (showCMSLanding) {
    return <LandingPage />;
  }
  
  return <PublicHomePage />;
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingSkeleton lines={10} />}>
      <HomeContent />
    </Suspense>
  );
}
