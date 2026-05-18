'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Web3Provider } from '@/lib/web3';
import { useAuth } from '@/hooks/useAuth';
import { usePortfolioStore } from '@/hooks/usePortfolio';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoginModal from '@/components/LoginModal';
import ParticlesProvider from '@/components/ParticlesProvider';
import { Inter } from 'next/font/google';
import { Lock } from 'lucide-react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const PROTECTED_ROUTES = ['/battles', '/housing'];

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading, isGuest } = useAuth();
  const { initUser, userId } = usePortfolioStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (session?.user && !userId) {
      initUser(session.user.id);
    }
  }, [session, userId, initUser]);

  // Redirect authenticated users (including guests) FROM landing TO dashboard
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

  // Block guests from protected routes
  if (isGuest && PROTECTED_ROUTES.includes(pathname)) {
    return (
      <div className="min-h-screen bg-[#0a0a1a]">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="glass-card !p-10 space-y-6">
            <Lock size={48} className="mx-auto text-[#f0b90b]" />
            <div>
              <h2 className="text-xl font-bold text-white mb-2">🔒 Acceso Premium</h2>
              <p className="text-[#8888b0] text-sm leading-relaxed">
                El modo {pathname.replace('/', '')} requiere conectar MetaMask.
              </p>
              <p className="text-[#5c5c80] text-xs mt-3">
                Conecta tu wallet para guardar progreso, batallar y construir tu casa.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 rounded-xl glass text-white text-sm font-medium hover:bg-[rgba(255,255,255,0.05)] transition"
              >
                ← Volver al trading
              </button>
              <LoginModal
                isOpen={false}
                onClose={() => {}}
                trigger={
                  <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#f6851b] to-[#e2761b] text-white text-sm font-medium hover:from-[#ff9a3c] hover:to-[#f6851b] transition shadow-lg shadow-[#f6851b]/20">
                    🦊 Conectar MetaMask
                  </button>
                }
              />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!session) {
    if (PROTECTED_ROUTES.includes(pathname)) {
      return (
        <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
          <LoginModal isOpen={true} onClose={() => {}} />
        </div>
      );
    }
    return <>{children}</>;
  }

  // If session exists but still on landing, show loader (redirect fires via useEffect)
  if (pathname === '/') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🏡</div>
          <p className="text-[#8888aa] text-sm">Bienvenido a HodlVille...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a1a] bg-aurora-dark">
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
          <ParticlesProvider>
          <AuthGate>
            {children}
          </AuthGate>
          </ParticlesProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
