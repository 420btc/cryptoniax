'use client';

import { useEffect } from 'react';
import { Web3Provider } from '@/lib/web3';
import { useAuth } from '@/hooks/useAuth';
import { usePortfolioStore } from '@/hooks/usePortfolio';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoginModal from '@/components/LoginModal';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, profile, loading } = useAuth();
  const { initUser, userId } = usePortfolioStore();

  useEffect(() => {
    if (session?.user && !userId) {
      initUser(session.user.id);
    }
  }, [session, userId, initUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🏡</div>
          <p className="text-[#8888aa] font-pixel text-xs">Cargando HodlVille...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
        <LoginModal isOpen={true} onClose={() => {}} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6 w-full">
        {children}
      </main>
      <Footer />
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0a0a1a] text-white`}>
        <Web3Provider>
          <AuthGate>
            {children}
          </AuthGate>
        </Web3Provider>
      </body>
    </html>
  );
}
