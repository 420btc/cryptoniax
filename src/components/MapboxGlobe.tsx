'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/hooks/useAuth';
import { usePortfolioStore } from '@/hooks/usePortfolio';
import { Globe, MapPin } from 'lucide-react';
import { getHouseStyle, HOUSE_LEVELS } from '@/lib/gameLogic';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface PlayerMarker {
  id: string;
  username: string;
  lng: number;
  lat: number;
  color: string;
  level: number;
  online: boolean;
  houseStyle: string;
  houseLevel: number;
}

const HOUSE_EMOJI: Record<string, string> = {
  tent: '🏕️',
  wood_house: '🪵',
  stone_house: '🏠',
  mansion: '🏛️',
  castle: '🏰',
};

export default function MapboxGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const { profile } = useAuthStore();

  // Load mapbox CSS dynamically (avoids Vercel CSS import issue)
  useEffect(() => {
    if (!document.getElementById('mapbox-css')) {
      const link = document.createElement('link');
      link.id = 'mapbox-css';
      link.rel = 'stylesheet';
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.10.0/mapbox-gl.css';
      document.head.appendChild(link);
    }
  }, []);
  const { activeTrades, house } = usePortfolioStore();

  useEffect(() => {
    if (!containerRef.current) return;

    let map: any;
    let mounted = true;

    import('mapbox-gl').then((mapboxgl) => {
      if (!mounted || !containerRef.current) return;
      if (!MAPBOX_TOKEN) { setMapError(true); return; }

      (mapboxgl as any).accessToken = MAPBOX_TOKEN;

      map = new mapboxgl.Map({
        container: containerRef.current!,
        style: 'mapbox://styles/mapbox/dark-v11',
        projection: 'globe',
        center: [0, 20],
        zoom: 1.5,
        pitch: 0,
        attributionControl: false,
      });

      mapRef.current = map;

      map.on('load', () => {
        if (!mounted) return;

        // Atmosphere glow
        map.setFog({
          color: 'rgb(10, 11, 30)',
          'high-color': 'rgb(40, 40, 100)',
          'horizon-blend': 0.2,
          'space-color': 'rgb(5, 5, 20)',
          'star-intensity': 0.6,
        });

        // Add player markers
        const markers = getPlayerMarkers(profile?.email, house?.style, house?.level);
        markers.forEach((p) => {
          // Player dot
          const el = document.createElement('div');
          el.className = 'map-marker';
          el.style.cssText = `
            width: ${p.online ? 14 : 10}px;
            height: ${p.online ? 14 : 10}px;
            background: ${p.color};
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.3);
            box-shadow: 0 0 ${p.online ? 8 : 4}px ${p.color};
            cursor: pointer;
          `;

          const popup = new mapboxgl.Popup({ offset: 15, closeButton: false }).setHTML(`
            <div style="color:#d0d0e0;font-size:12px;font-family:Inter,sans-serif">
              <strong style="color:white">${p.username}</strong>
              <div style="color:#5c5c80;font-size:10px">Lv.${p.level} · ${p.online ? '🟢 Online' : '⚫ Offline'}</div>
              <div style="color:#fbbf24;font-size:10px;margin-top:2px">${HOUSE_EMOJI[p.houseStyle] || '🏚️'} ${p.houseStyle.replace('_',' ')} Nv.${p.houseLevel}</div>
            </div>
          `);

          new mapboxgl.Marker({ element: el })
            .setLngLat([p.lng, p.lat])
            .setPopup(popup)
            .addTo(map);

          // House marker (slightly offset)
          if (HOUSE_EMOJI[p.houseStyle]) {
            const houseEl = document.createElement('div');
            houseEl.style.cssText = `
              font-size: 18px;
              cursor: pointer;
              filter: drop-shadow(0 0 4px rgba(251,191,36,0.4));
              transform: translate(-50%, -100%);
              position: absolute;
              pointer-events: none;
            `;
            houseEl.textContent = HOUSE_EMOJI[p.houseStyle];

            // Add house as a separate marker slightly above
            const houseMarker = new mapboxgl.Marker({ element: houseEl, anchor: 'bottom' })
              .setLngLat([p.lng + 0.3, p.lat + 0.15])
              .addTo(map);
          }
        });

        setLoaded(true);
      });

      // Auto-rotate slowly
      let userInteracting = false;
      map.on('mousedown', () => { userInteracting = true; });
      map.on('mouseup', () => { setTimeout(() => { userInteracting = false; }, 2000); });
      
      const spinGlobe = () => {
        if (!userInteracting && map) {
          const center = map.getCenter();
          center.lng += 0.03;
          map.easeTo({ center, duration: 200, easing: (n: number) => n });
        }
        requestAnimationFrame(spinGlobe);
      };
      spinGlobe();
    }).catch(() => {
      if (mounted) setMapError(true);
    });

    return () => {
      mounted = false;
      if (map) map.remove();
    };
  }, [profile, house]);

  return (
    <div className="glass-card !p-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(99,102,241,0.08)]">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-[#818cf8]" />
          <span className="text-sm font-bold text-white">🌍 HodlVille World</span>
          <span className="text-[10px] text-[#5c5c80] bg-[rgba(99,102,241,0.1)] px-1.5 py-0.5 rounded">
            Mapbox Globe
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-[#5c5c80]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#22d65e]" /> Online</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#5c5c80]" /> Offline</span>
          <span className="flex items-center gap-1">🏰 Casas</span>
        </div>
      </div>
      <div ref={containerRef} style={{ width: '100%', height: 500 }} />
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[rgba(5,5,15,0.8)]">
          <div className="text-center space-y-2">
            <Globe size={40} className="mx-auto text-[#5c5c80]" />
            <p className="text-sm text-[#8888b0]">Mapa no disponible</p>
            <p className="text-[10px] text-[#5c5c80]">Requiere Mapbox token en Vercel</p>
          </div>
        </div>
      )}
      {!loaded && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="animate-spin w-6 h-6 border-2 border-[#818cf8] border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
}

// Mock players around the world with houses
function getPlayerMarkers(currentUser?: string, userHouseStyle?: string, userHouseLevel?: number): PlayerMarker[] {
  const houseStyles = ['tent', 'wood_house', 'stone_house', 'mansion', 'castle'];
  const randomHouse = () => houseStyles[Math.floor(Math.random() * houseStyles.length)];

  const markers: PlayerMarker[] = [
    { id: 'p1', username: 'CryptoKing', lng: -74.006, lat: 40.7128, color: '#00e6ff', level: 5, online: true, houseStyle: 'mansion', houseLevel: 12 },
    { id: 'p2', username: 'HodlQueen', lng: -0.1278, lat: 51.5074, color: '#f7a600', level: 3, online: true, houseStyle: 'stone_house', houseLevel: 7 },
    { id: 'p3', username: 'SolanaWolf', lng: 139.6917, lat: 35.6895, color: '#ff007a', level: 4, online: true, houseStyle: 'wood_house', houseLevel: 4 },
    { id: 'p4', username: 'BTCMaxi', lng: 151.2093, lat: -33.8688, color: '#f0b90b', level: 6, online: false, houseStyle: 'castle', houseLevel: 16 },
    { id: 'p5', username: 'EthSurfer', lng: 2.3522, lat: 48.8566, color: '#00e6ff', level: 2, online: true, houseStyle: 'tent', houseLevel: 2 },
    { id: 'p6', username: 'TradeWizard', lng: 37.6173, lat: 55.7558, color: '#f0b90b', level: 7, online: true, houseStyle: 'mansion', houseLevel: 11 },
    { id: 'p7', username: 'DiamondHands', lng: -99.1332, lat: 19.4326, color: '#f7a600', level: 3, online: false, houseStyle: 'stone_house', houseLevel: 6 },
    { id: 'p8', username: 'MoonBoy', lng: 126.978, lat: 37.5665, color: '#ff007a', level: 1, online: true, houseStyle: 'tent', houseLevel: 1 },
    { id: 'p9', username: 'CryptoNinja', lng: 103.8198, lat: 1.3521, color: '#00e6ff', level: 4, online: true, houseStyle: 'wood_house', houseLevel: 3 },
  ];

  if (currentUser) {
    markers.push({
      id: 'you',
      username: currentUser.split('@')[0] || 'Tú',
      lng: -3.7038,
      lat: 40.4168,
      color: '#22d65e',
      level: 1,
      online: true,
      houseStyle: userHouseStyle || 'tent',
      houseLevel: userHouseLevel || 1,
    });
  }

  return markers;
}
