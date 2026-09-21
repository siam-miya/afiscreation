'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function UserAuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUser = () => {
      try {
        const storedUser = localStorage.getItem('user') || localStorage.getItem('adminUser');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user?.role === 'admin' || user?.role === 'moderator') {
            setIsAdmin(true);
            router.replace('/secret-admin-portal-afia/dashboard');
            return;
          }
        }
      } catch (e) {
        console.error('Auth guard error:', e);
      }
      setIsAdmin(false);
      setChecking(false);
    };

    checkUser();

    window.addEventListener('userStateChanged', checkUser);
    window.addEventListener('storage', checkUser);

    return () => {
      window.removeEventListener('userStateChanged', checkUser);
      window.removeEventListener('storage', checkUser);
    };
  }, [router, pathname]);

  if (checking || isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-[#eb6e1b] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
