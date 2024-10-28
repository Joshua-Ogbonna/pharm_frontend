"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, logout } from '@/lib/auth';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'pharmacist' | 'consumer';
}

export default function ProtectedLayout({ children, requiredRole }: LayoutProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      router.push('/unauthorized');
      return;
    }

    setLoading(false);
  }, [router, requiredRole]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold">QRAS</span>
              </div>
              <div className="hidden flex-wrap items-center gap-4 sm:ml-6 sm:flex sm:space-x-8">
                <a
                  href="/dashboard"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </a>
                <a
                  href="/scan"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Scan QR
                </a>
                {getUser()?.role === 'admin' && (
                  <a
                    href="/admin/products"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Manage Products
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={logout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 text-gray-100">
        {children}
      </main>
    </div>
  );
}