'use client';

import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';
import { usePortfolioStore } from '@/hooks/usePortfolio';

export default function CobeGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { house } = usePortfolioStore();

  useEffect(() => {
    let phi = 0;
    let width = 0;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener('resize', onResize);
    onResize();

    if (!canvasRef.current) return;

    // Define some game markers around the globe
    const markers = [
      // Player marker (based on house level)
      { location: [40.7128, -74.0060], size: 0.1 + ((house?.level || 1) * 0.02) },
      // NPCs / Other traders
      { location: [35.6895, 139.6917], size: 0.05 },
      { location: [51.5074, -0.1278], size: 0.08 },
      { location: [-33.8688, 151.2093], size: 0.04 },
      { location: [22.3094, 114.1736], size: 0.06 },
      { location: [48.8566, 2.3522], size: 0.07 },
    ];

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.1, 0.1, 0.15],
      markerColor: [0.38, 0.4, 0.94], // #6366f1 roughly
      glowColor: [0.1, 0.1, 0.2],
      markers: markers,
      onRender: (state) => {
        // Rotación lenta
        state.phi = phi;
        phi += 0.003;
      },
    });

    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.style.opacity = '1';
      }
    });

    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, [house?.level]);

  return (
    <div className="relative w-full aspect-square max-w-[600px] mx-auto flex items-center justify-center">
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          contain: 'layout paint size',
          opacity: 0,
          transition: 'opacity 1s ease',
        }}
      />
      <div className="absolute inset-0 pointer-events-none rounded-full" style={{
        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)'
      }} />
    </div>
  );
}