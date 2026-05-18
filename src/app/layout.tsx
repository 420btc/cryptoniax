'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Web3Provider } from '@/lib/web3';
import { useAuth } from '@/hooks/useAuth';
import { usePortfolioStore } from '@/hooks/usePortfolio';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoginModal from '@/components/LoginModal';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const PROTECTED_ROUTES = ['/dashboard', '/world', '/battles'];

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const { initUser, userId } = usePortfolioStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (session?.user && !userId) {
      initUser(session.user.id);
    }
  }, [session, userId, initUser]);

  // Redirect authenticated users from landing to dashboard
  useEffect(() => {
    if (!loading && session && pathname === '/') {
      router.replace('/dashboard');
    }
  }, [loading, session, pathname, router]);

  // Redirect unauthenticated users from protected routes to landing
  useEffect(() => {
    if (!loading && !session && PROTECTED_ROUTES.includes(pathname)) {
      router.replace('/');
    }
  }, [loading, session, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🏡</div>
          <p className="text-[#8888aa] text-sm">Cargando HodlVille...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    // Only show login gate on protected routes; landing page handles its own login
    if (PROTECTED_ROUTES.includes(pathname)) {
      return (
        <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
          <LoginModal isOpen={true} onClose={() => {}} />
        </div>
      );
    }
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a1a]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-[#0a0a1a]">
      <head>
        <meta name="theme-color" content="#0a0a1a" />
      </head>
      <body className={`${inter.className} bg-[#0a0a1a] text-white antialiased`} style={{ backgroundColor: '#0a0a1a' }}>
        <Web3Provider>
          <AuthGate>
            {children}
          </AuthGate>
        </Web3Provider>
      </body>
    </html>
  );
}
