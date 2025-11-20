"use client";
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function DevAutoLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const username = searchParams.get('username') || 'devtest';
    const role = searchParams.get('role') || 'viewer';

    if (token) {
      try {
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        localStorage.setItem('role', role);
        localStorage.setItem('user', JSON.stringify({ username, email: `${username}@example.com`, role }));
        // short delay so user sees message
        setTimeout(() => router.push('/dashboard'), 300);
      } catch (err) {
        // if localStorage blocked, redirect to login page
        console.error('Auto-login failed:', err);
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router, searchParams]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Auto login</h2>
      <p>If you provided a token it will be stored and you'll be redirected to the dashboard.</p>
      <p>If nothing happens, open the <a href="/login">login page</a> instead.</p>
    </div>
  );
}
