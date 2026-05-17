'use client';

import dynamic from 'next/dynamic';

const WorldCanvas = dynamic(() => import('@/components/World'), {
  ssr: false,
  loading: () => (
    <div className="bg-[#12122a] rounded-2xl pixel-border p-20 text-center">
      <div className="text-4xl mb-4 animate-pulse">🌍</div>
      <p className="text-[#8888aa]">Cargando mundo pixel...</p>
    </div>
  ),
});

export default function WorldPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">🌍 HodlVille</h1>
        <p className="text-[#8888aa] text-sm mt-1">Tu mundo crece con tus HODLs y trades.</p>
      </div>
      <WorldCanvas />
    </div>
  );
}
