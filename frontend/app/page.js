'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.replace('/dashboard'); // Use replace instead of push
    } else {
      router.replace('/login');
    }
  }, [router]);

  return null; // Or a loading spinner
}