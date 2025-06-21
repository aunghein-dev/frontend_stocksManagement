'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) router.push('/login');
  }, [user]);

  return <>{user && children}</>;
}
