'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '@/hooks/useAuth';
import { usePortfolioStore } from '@/hooks/usePortfolio';
import { Globe, MapPin, Users, Radio } from 'lucide-react';

// Simple 3D globe using Three.js via a lightweight Sphere mesh
// with user location markers. Uses globe.gl when installed.

interface UserLocation {
  id: string;
  username: string;
  lat: number;
  lng: number;
  exchange: string;
  color: string;
  level: number;
  online: boolean;
}

function createGlobe(
  container: HTMLDivElement,
  markers: UserLocation[],
  onMarkerClick?: (user: UserLocation) => void
) {
  // Dynamic import of Three.js to avoid SSR issues
  import('three').then((THREE) => {
    // Prevent double init
    if (container.querySelector('canvas')) return;

    const w = container.clientWidth;
    const h = Math.min(500, w * 0.7);

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.set(0, 0.5, 3.5);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Globe
    const geometry = new THREE.SphereGeometry(1.2, 64, 48);
    const material = new THREE.MeshPhongMaterial({
      color: 0x0a0b2e,
      emissive: 0x050510,
      specular: 0x111133,
      shininess: 10,
      transparent: true,
      opacity: 0.9,
    });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Grid lines (latitude/longitude)
    const gridMat = new THREE.LineBasicMaterial({ color: 0x1a1a4a, transparent: true, opacity: 0.3 });
    for (let lat = -80; lat <= 80; lat += 20) {
      const points: THREE.Vector3[] = [];
      const phi = (lat * Math.PI) / 180;
      for (let lng = 0; lng <= 360; lng += 5) {
        const theta = (lng * Math.PI) / 180;
        points.push(new THREE.Vector3(
          1.21 * Math.cos(phi) * Math.cos(theta),
          1.21 * Math.sin(phi),
          1.21 * Math.cos(phi) * Math.sin(theta)
        ));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      scene.add(new THREE.Line(geo, gridMat));
    }

    // Atmosphere glow
    const glowGeo = new THREE.SphereGeometry(1.25, 64, 48);
    const glowMat = new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          gl_FragColor = vec4(0.388, 0.4, 0.945, 0.15) * intensity;
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glow);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x333366, 0.8);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0x8888ff, 1.0);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    // Stars
    const starsGeo = new THREE.BufferGeometry();
    const starPositions: number[] = [];
    for (let i = 0; i < 300; i++) {
      const r = 4 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.asin((Math.random() * 2) - 1);
      starPositions.push(
        r * Math.cos(phi) * Math.cos(theta),
        r * Math.sin(phi),
        r * Math.cos(phi) * Math.sin(theta)
      );
    }
    starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0x4444aa, size: 0.03 });
    scene.add(new THREE.Points(starsGeo, starsMat));

    // Markers
    const markersGroup = new THREE.Group();
    scene.add(markersGroup);

    function latLngToVec3(lat: number, lng: number, radius: number = 1.22): THREE.Vector3 {
      const phi = (lat * Math.PI) / 180;
      const theta = (lng * Math.PI) / 180;
      return new THREE.Vector3(
        radius * Math.cos(phi) * Math.cos(theta),
        radius * Math.sin(phi),
        radius * Math.cos(phi) * Math.sin(theta)
      );
    }

    markers.forEach((m) => {
      const pos = latLngToVec3(m.lat, m.lng);
      const dotGeo = new THREE.SphereGeometry(0.03, 8, 8);
      const dotMat = new THREE.MeshBasicMaterial({ color: m.color });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(pos);
      dot.userData = m;
      markersGroup.add(dot);

      // Pulse ring
      if (m.online) {
        const ringGeo = new THREE.RingGeometry(0.035, 0.05, 16);
        const ringMat = new THREE.MeshBasicMaterial({
          color: m.color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.4,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(pos);
        ring.lookAt(new THREE.Vector3(0, 0, 0));
        markersGroup.add(ring);
      }
    });

    // Raycaster for clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    container.addEventListener('click', (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / w) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / h) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markersGroup.children);
      if (intersects.length > 0 && onMarkerClick) {
        onMarkerClick(intersects[0].object.userData as UserLocation);
      }
    });

    // Auto-rotate
    let autoRotate = true;
    let dragStart = { x: 0, y: 0 };
    let dragRotation = { x: 0, y: 0 };

    container.addEventListener('mousedown', (e) => {
      autoRotate = false;
      dragStart = { x: e.clientX, y: e.clientY };
    });
    container.addEventListener('mouseup', () => {
      setTimeout(() => { autoRotate = true; }, 2000);
    });
    container.addEventListener('mousemove', (e) => {
      if (autoRotate) return;
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      globe.rotation.y += dx * 0.005;
      globe.rotation.x += dy * 0.005;
      dragStart = { x: e.clientX, y: e.clientY };
    });

    // Animation
    function animate() {
      requestAnimationFrame(animate);
      if (autoRotate) {
        globe.rotation.y += 0.001;
      }
      // Rotate markers with globe
      markersGroup.rotation.copy(globe.rotation);
      // Pulse animations
      markersGroup.children.forEach((child, i) => {
        if (i % 2 === 1) {
          child.scale.setScalar(1 + Math.sin(Date.now() * 0.003 + i) * 0.3);
        }
      });
      renderer.render(scene, camera);
    }
    animate();

    // Resize
    window.addEventListener('resize', () => {
      const nw = container.clientWidth;
      const nh = Math.min(500, nw * 0.7);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
  });
}

// ── React Component ──

export default function BattleGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { profile } = useAuthStore();
  const { activeTrades } = usePortfolioStore();
  const [selectedUser, setSelectedUser] = useState<UserLocation | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationEnabled, setLocationEnabled] = useState(false);

  // Get user's real location
  const enableLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationEnabled(true);
      },
      () => {
        // Fallback: random location for demo
        setUserLocation({ lat: 40.4168 + (Math.random() - 0.5) * 10, lng: -3.7038 + (Math.random() - 0.5) * 10 });
        setLocationEnabled(true);
      }
    );
  }, []);

  const disableLocation = useCallback(() => {
    setLocationEnabled(false);
  }, []);

  // Build markers from real users (mock + your location)
  const markers: UserLocation[] = [];

  if (userLocation && locationEnabled) {
    markers.push({
      id: profile?.email || 'you',
      username: profile?.email?.split('@')[0] || 'Tú',
      lat: userLocation.lat,
      lng: userLocation.lng,
      exchange: 'bingx',
      color: '#22d65e',
      level: 1,
      online: true,
    });
  }

  // Mock traders around the world
  const mockTraders: UserLocation[] = [
    { id: 'trader1', username: 'CryptoKing', lat: 40.7128, lng: -74.006, exchange: 'hyperliquid', color: '#00e6ff', level: 5, online: true },
    { id: 'trader2', username: 'HodlQueen', lat: 51.5074, lng: -0.1278, exchange: 'bybit', color: '#f7a600', level: 3, online: true },
    { id: 'trader3', username: 'SolanaWolf', lat: 35.6895, lng: 139.6917, exchange: 'uniswap', color: '#ff007a', level: 4, online: true },
    { id: 'trader4', username: 'BTCMaxi', lat: -33.8688, lng: 151.2093, exchange: 'bingx', color: '#f0b90b', level: 6, online: false },
    { id: 'trader5', username: 'EthSurfer', lat: 48.8566, lng: 2.3522, exchange: 'hyperliquid', color: '#00e6ff', level: 2, online: true },
    { id: 'trader6', username: 'TradeWizard', lat: 55.7558, lng: 37.6173, exchange: 'bingx', color: '#f0b90b', level: 7, online: true },
    { id: 'trader7', username: 'DiamondHands', lat: 19.4326, lng: -99.1332, exchange: 'bybit', color: '#f7a600', level: 3, online: false },
    { id: 'trader8', username: 'MoonBoy', lat: 37.5665, lng: 126.978, exchange: 'uniswap', color: '#ff007a', level: 1, online: true },
    { id: 'trader9', username: 'CryptoNinja', lat: 1.3521, lng: 103.8198, exchange: 'hyperliquid', color: '#00e6ff', level: 4, online: true },
  ];

  markers.push(...mockTraders);

  useEffect(() => {
    if (!containerRef.current) return;
    createGlobe(containerRef.current, markers, setSelectedUser);
  }, [locationEnabled, userLocation]);

  return (
    <div className="glass-card !p-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(99,102,241,0.08)]">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-[#818cf8]" />
          <span className="text-sm font-bold text-white">🌍 Red Global de Batalla</span>
          <span className="text-[10px] text-[#5c5c80] bg-[rgba(99,102,241,0.1)] px-1.5 py-0.5 rounded">
            {markers.length} traders
          </span>
        </div>
        <button
          onClick={locationEnabled ? disableLocation : enableLocation}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            locationEnabled
              ? 'bg-[rgba(34,214,94,0.15)] text-[#22d65e]'
              : 'bg-[rgba(99,102,241,0.15)] text-[#818cf8] hover:bg-[rgba(99,102,241,0.25)]'
          }`}
        >
          <Radio size={12} className={locationEnabled ? 'animate-pulse' : ''} />
          {locationEnabled ? 'Ubicación activa' : 'Activar ubicación'}
        </button>
      </div>

      <div ref={containerRef} className="w-full" style={{ minHeight: 400 }} />

      {/* Selected user card */}
      {selectedUser && (
        <div className="px-5 py-3 border-t border-[rgba(99,102,241,0.08)] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ background: `${selectedUser.color}20`, color: selectedUser.color }}>
            {selectedUser.username[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-white">{selectedUser.username}</div>
            <div className="text-[10px] text-[#5c5c80]">
              Lv.{selectedUser.level} · {selectedUser.exchange} · {selectedUser.online ? '🟢 Online' : '⚫ Offline'}
            </div>
          </div>
          <button className="px-3 py-1.5 rounded-lg glass text-xs text-[#818cf8] hover:text-white transition">
            Retar a Batalla
          </button>
        </div>
      )}
    </div>
  );
}
