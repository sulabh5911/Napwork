'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/products');
  }, [router]);

  return (
    <div className="loading-wrapper">
      <div className="loading-spinner"></div>
      <span className="loading-text">Redirecting...</span>
    </div>
  );
}
