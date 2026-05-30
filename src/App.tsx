/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useState, useEffect, useLayoutEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { audioEngine } from './audioEngine';
import {
  Activity,
  Layers,
  Volume2,
  VolumeX,
  Maximize2,
  Cpu,
  ArrowUpRight,
  Zap,
  RefreshCw
} from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// -------------------------------------------------------------
// SHARD METADATA DECLARATION
// -------------------------------------------------------------
interface ShardInfo {
  id: number;
  title: string;
  category: string;
  tech: string;
  metrics: string;
  desc: string;
  pts: [number, number][];
  centroid: [number, number];
  drift: [number, number, number];
  rotationRate: [number, number, number];
  settledPos: [number, number, number];
}

// -------------------------------------------------------------
// MULTI-PRESET SHATTER DESIGNS (4 DISTINCT GLASS BREAKING EFFECTS)
// -------------------------------------------------------------
export const PRESETS_DATA = [
  {
    name: "01_GEOMETRIC",
    title: "Crystal Geometric Polyhedron",
    desc: "Seamless minimal polyhedron shards with symmetrical centroid translation drift.",
    cracks: [
      [[0, 2], [-0.8, 0.4]],
      [[-0.8, 0.4], [-3, 0]],
      [[-0.8, 0.4], [0.7, 0.6]],
      [[0.7, 0.6], [3, 0.5]],
      [[0.7, 0.6], [1.2, -0.6]],
      [[1.2, -0.6], [3, -1]],
      [[1.2, -0.6], [0.2, -0.8]],
      [[0.2, -0.8], [3, -2]],
      [[0.2, -0.8], [0, -2]],
      [[0.2, -0.8], [-1.1, -0.7]],
      [[-1.1, -0.7], [-3, -0.5]],
      [[-3, -0.5], [-3, 0]]
    ] as [number, number][][],
    shards: [
      {
        id: 1,
        title: "MERN Stack Cloud Core",
        category: "ARCHITECTURAL SYSTEM",
        tech: "React, Node.js, Redis, Spanner",
        metrics: "Latency: <18ms | Cap: 45K r/s",
        desc: "Robust state-synced real-time core engines driving high-throughput microservices.",
        pts: [[-3, 2], [0, 2], [-0.8, 0.4], [-3, 0]],
        centroid: [-1.7, 1.1],
        drift: [-1.4, 1.5, 0.9],
        rotationRate: [-0.4, 0.6, -0.2],
        settledPos: [-3.4, 1.35, -0.6]
      },
      {
        id: 2,
        title: "Pixify Video Synthesizer",
        category: "MEDIA PIPELINE",
        tech: "Wasm, Rust, WebAssembly, Canvas",
        metrics: "Transcode: 240fps | Synced",
        desc: "Low-overhead audio-video synchronization engines running client-side with full asset encoding pipelines.",
        pts: [[0, 2], [3, 2], [3, 0.5], [0.7, 0.6], [-0.8, 0.4]],
        centroid: [1.18, 1.10],
        drift: [1.5, 1.3, 0.7],
        rotationRate: [0.3, -0.5, 0.4],
        settledPos: [3.4, 1.35, -0.6]
      },
      {
        id: 3,
        title: "Morphic Luxury Matrix",
        category: "E-COMMERCE CORE",
        tech: "Next.js, GLSL Layouts, Shopify",
        metrics: "Ctr: +4.2% | Rate: 120fps",
        desc: "Bespoke ultra-fluid virtual merchant spaces optimized for maximum client render pipeline throughput.",
        pts: [[3, 0.5], [3, -1], [1.2, -0.6], [0.7, 0.6]],
        centroid: [1.975, -0.125],
        drift: [1.9, -0.1, 0.6],
        rotationRate: [-0.5, 0.4, 0.5],
        settledPos: [3.4, -1.35, -0.6]
      },
      {
        id: 4,
        title: "Vortex Neural Network",
        category: "REALTIME AI INFERENCE",
        tech: "TensorFlow.js, WebGL, WebSocket",
        metrics: "Accuracy: 99.4% | Model: 18MB",
        desc: "In-browser deep model classification engines processing high-frequency continuous streaming signals.",
        pts: [[3, -1], [3, -2], [0, -2], [0.2, -0.8], [1.2, -0.6]],
        centroid: [1.48, -1.28],
        drift: [1.1, -1.5, 0.5],
        rotationRate: [0.4, 0.5, -0.3],
        settledPos: [0.0, -1.35, -0.6]
      },
      {
        id: 5,
        title: "Aura Sound Array",
        category: "PROCEDURAL SPECTRUM",
        tech: "Web Audio, Spatial Panning",
        metrics: "Nodes: 480 | Thd: 0.002%",
        desc: "Binaural immersive sound engines delivering custom synthesized microsecond precise acoustics.",
        pts: [[0, -2], [-3, -2], [-3, -0.5], [-1.1, -0.7], [0.2, -0.8]],
        centroid: [-1.38, -1.2],
        drift: [-1.6, -1.3, 0.8],
        rotationRate: [-0.3, -0.4, 0.5],
        settledPos: [-3.4, -1.35, -0.6]
      },
      {
        id: 6,
        title: "Chronos Metric Suite",
        category: "TELEMETRY ENGINE",
        tech: "D3.js, WebGL Grid, WebWorkers",
        metrics: "Pts: 2.5M | Redraw: 60Hz",
        desc: "Multi-threaded analytical visualizers rendering million-node database logs instantly.",
        pts: [[-3, -0.5], [-3, 0], [-0.8, 0.4], [0.7, 0.6], [1.2, -0.6], [0.2, -0.8], [-1.1, -0.7]],
        centroid: [-0.83, -0.23],
        drift: [-0.9, 0.2, 1.0],
        rotationRate: [0.5, -0.2, -0.4],
        settledPos: [0.0, 1.35, -0.6]
      }
    ] as ShardInfo[]
  },
  {
    name: "02_SPIDERWEB",
    title: "Radial Stress Spiderweb Strike",
    desc: "Thin triangular fan wedges radiating outward from an ultra-velocity center point impact vector.",
    cracks: [
      [[0, 0], [0, 2]],
      [[0, 0], [1.5, 2]],
      [[0, 0], [3, 0.8]],
      [[0, 0], [3, -0.8]],
      [[0, 0], [1.5, -2]],
      [[0, 0], [-1.5, -2]],
      [[0, 0], [-3, -0.8]],
      [[0, 0], [-3, 0.8]],
      [[0, 0], [-1.5, 2]]
    ] as [number, number][][],
    shards: [
      {
        id: 1,
        title: "Apex Impact Driver Node",
        category: "CRITICAL CORE",
        tech: "React, Rust, GLSL, WebGL",
        metrics: "Velocity: Mach 2.4 | Active",
        desc: "Centrally positioned bullet trajectory point stress rays translating polar stress coordinates dynamically.",
        pts: [[0, 0], [-1.5, 2], [0, 2]],
        centroid: [-0.5, 1.3],
        drift: [-1.2, 1.8, 1.1],
        rotationRate: [-0.6, 0.8, -0.4],
        settledPos: [-3.4, 1.35, -0.6]
      },
      {
        id: 2,
        title: "Northeast Buffer Quadrant",
        category: "FLIGHT TRACKER",
        tech: "Wasm, Canvas Pipeline, GSAP",
        metrics: "Buffer: 4.09MB | Stable",
        desc: "Vector translation shards mapping radial displacement parameters cleanly into linear flight paths on blast.",
        pts: [[0, 0], [0, 2], [1.5, 2]],
        centroid: [0.5, 1.3],
        drift: [1.1, 1.9, 0.8],
        rotationRate: [0.4, -0.7, 0.5],
        settledPos: [0.0, 1.35, -0.6]
      },
      {
        id: 3,
        title: "Morphic Lux Expansion",
        category: "E-COMMERCE METRIC",
        tech: "Shopify Hydrogen, WebGL Core",
        metrics: "Rate: 14G/s | Latency <1ms",
        desc: "High-contrast dynamic spatial merchant structures reflecting physical laser stress coordinates seamlessly.",
        pts: [[0, 0], [1.5, 2], [3, 0.8]],
        centroid: [1.5, 0.9],
        drift: [1.9, 0.8, 0.7],
        rotationRate: [-0.3, 0.6, 0.7],
        settledPos: [3.4, 1.35, -0.6]
      },
      {
        id: 4,
        title: "Vortex Neural Sifter",
        category: "COGNITIVE SPECTRUM",
        tech: "TensorFlow.js, WebSocket Hub",
        metrics: "Accuracy: 99.8% | Active",
        desc: "Asynchronous neural class decision layers evaluating high-stress frequency feedback intervals.",
        pts: [[0, 0], [3, 0.8], [3, -0.8]],
        centroid: [2.0, 0],
        drift: [2.0, -0.2, 0.4],
        rotationRate: [0.5, 0.4, -0.5],
        settledPos: [3.4, -1.35, -0.6]
      },
      {
        id: 5,
        title: "Aura Spatial Acoustic Wave",
        category: "SOUND REVERB FIELD",
        tech: "Web Audio, Spatial Reverb",
        metrics: "Chimes: 5 Resonant Bells",
        desc: "Coordinated spatial sound synthesis engine firing custom physical campanology tones on impact.",
        pts: [[0, 0], [3, -0.8], [1.5, -2]],
        centroid: [1.5, -0.9],
        drift: [1.6, -1.2, 0.9],
        rotationRate: [-0.5, -0.3, 0.6],
        settledPos: [0.0, -1.35, -0.6]
      },
      {
        id: 6,
        title: "Analytical Logging Monitor",
        category: "TELEMETRY SPECTRUM",
        tech: "D3 Engine, Node JS Thread",
        metrics: "Trace: 1.8M pts | 120Hz",
        desc: "Parallel data thread logging and plotting structural integrity coefficients securely in real-time.",
        pts: [[0, 0], [1.5, -2], [-1.5, -2]],
        centroid: [0, -1.3],
        drift: [-0.2, -1.8, 0.8],
        rotationRate: [0.6, -0.4, -0.3],
        settledPos: [-3.4, -1.35, -0.6]
      }
    ] as ShardInfo[]
  },
  {
    name: "03_SPLINTER",
    title: "Jagged Asynchronous Splinter",
    desc: "Long, vertical shear fault lines generating asymmetric high-aspect-ratio longitudinal splinter arrays.",
    cracks: [
      [[-3, 2], [-1.2, 2]],
      [[-1.2, 2], [-2, -2]],
      [[-2, -2], [-3, -2]],
      [[-1.2, 2], [1, 2]],
      [[1, 2], [-0.5, 0]],
      [[-0.5, 0], [-2, -2]],
      [[1, 2], [3, 2]],
      [[3, 2], [1.8, 0]],
      [[1.8, 0], [-0.5, 0]],
      [[1.8, 0], [3, -0.8]],
      [[3, -0.8], [3, -2]],
      [[3, -2], [0.8, -2]],
      [[0.8, -2], [1.8, 0]],
      [[0.8, -2], [-1, -2]],
      [[-1, -2], [0.3, 0]]
    ] as [number, number][][],
    shards: [
      {
        id: 1,
        title: "Western Shearing Pane",
        category: "LONGITUDINAL FAULT",
        tech: "Node.js, C++ V8 Engine",
        metrics: "Shear Coefficient: 0.94",
        desc: "Heavy structural splinter boundaries separating under stress with elevated friction constants.",
        pts: [[-3, 2], [-1.2, 2], [-2, -2], [-3, -2]],
        centroid: [-2.3, 0.0],
        drift: [-1.8, 0.2, 0.8],
        rotationRate: [-0.2, 0.9, -0.1],
        settledPos: [-3.4, 1.35, -0.6]
      },
      {
        id: 2,
        title: "Compression Fault Block",
        category: "CORE PRESSURE TENSION",
        tech: "D3 Grid, GLSL Displacement",
        metrics: "Thermals: 44C | Stable",
        desc: "Central compression fault plate distributing mechanical strain properties until critical failure.",
        pts: [[-1.2, 2], [1, 2], [-0.5, 0], [-2, -2]],
        centroid: [-0.67, 0.5],
        drift: [-0.9, 1.6, 0.7],
        rotationRate: [0.5, -0.4, 0.3],
        settledPos: [0.0, 1.35, -0.6]
      },
      {
        id: 3,
        title: "Eastern Splinter Section",
        category: "PARABOLIC FLIGHT",
        tech: "Wasm, Hydrogen Shopify",
        metrics: "CTR: +1.8% | Framerate HIGH",
        desc: "Elegant retail splinter elements designed to rotate extremely flat upon structural dispersal.",
        pts: [[1, 2], [3, 2], [1.8, 0], [-0.5, 0]],
        centroid: [1.32, 1.0],
        drift: [1.9, 1.5, 0.9],
        rotationRate: [-0.6, 0.5, 0.6],
        settledPos: [3.4, 1.35, -0.6]
      },
      {
        id: 4,
        title: "Vortex Boundary Splinter",
        category: "COGNITIVE PIPELINE",
        tech: "TensorFlow.js WebWorkers",
        metrics: "Latency: <12ms / Threaded",
        desc: "Asymmetric border fragment analyzing real-time cognitive tensors completely client-side.",
        pts: [[3, 2], [3, -0.8], [1.8, 0]],
        centroid: [2.6, 0.4],
        drift: [1.8, -0.8, 0.5],
        rotationRate: [0.3, 0.4, -0.7],
        settledPos: [3.4, -1.35, -0.6]
      },
      {
        id: 5,
        title: "Aura Decoupled Splint",
        category: "IMMERSIVE ACOUSTIC Node",
        tech: "Web Audio, Fourier Arrays",
        metrics: "THD: 0.0005% | Low Latency",
        desc: "Independent audio waveform shard triggering resonant chime tones upon mechanical shear stress.",
        pts: [[1.8, 0], [3, -0.8], [3, -2], [0.8, -2]],
        centroid: [2.15, -0.95],
        drift: [1.5, -1.6, 0.6],
        rotationRate: [-0.4, -0.5, 0.4],
        settledPos: [0.0, -1.35, -0.6]
      },
      {
        id: 6,
        title: "Analytical Metric Splinter",
        category: "DATA SIFT MONITOR",
        tech: "WebGL Plot, React 18 Engine",
        metrics: "Trace Rate: 2.2M points/sec",
        desc: "Longitudinal telemetry monitor plotting live structural integrity index readings securely.",
        pts: [[-0.5, 0], [1.8, 0], [0.8, -2], [-1, -2]],
        centroid: [0.27, -1.0],
        drift: [-0.5, -1.8, 0.9],
        rotationRate: [0.7, -0.3, -0.2],
        settledPos: [-3.4, -1.35, -0.6]
      }
    ] as ShardInfo[]
  },
  {
    name: "04_CHAOS",
    title: "Chaotic Hyper Splinter Matrix",
    desc: "A completely asymmetric micro-fracturing layout with uneven polygonal shards tracking hyper-chaotic paths.",
    cracks: [
      [[-3, 2], [-0.5, 1.8]],
      [[-0.5, 1.8], [1.8, 2]],
      [[1.8, 2], [3, 2]],
      [[1.8, 2], [1.0, 0.6]],
      [[1.0, 0.6], [-1.2, 0.5]],
      [[-1.2, 0.5], [-3, 0.8]],
      [[3, 2], [3, 0.8]],
      [[3, 0.8], [1.5, -0.4]],
      [[1.5, -0.4], [3, -1]],
      [[3, -1], [3, -2]],
      [[3, -1], [0.8, -1.8]],
      [[0.8, -1.8], [-1.2, -1.8]],
      [[-1.2, -1.8], [-3, -2]],
      [[-3, -2], [-3, -0.6]],
      [[-3, -0.6], [-0.8, -0.5]]
    ] as [number, number][][],
    shards: [
      {
        id: 1,
        title: "Chaos Anchor Poly",
        category: "SPECTRAL ENGINE",
        tech: "TS Core, GLSL Shaders",
        metrics: "Drift Factor: 1.8 | HIGH",
        desc: "Erratic fast-moving fragment displaying non-linear coordinates under severe shockwaves.",
        pts: [[-3, 2], [-0.5, 1.8], [-1.2, 0.5], [-3, 0.8]],
        centroid: [-1.9, 1.3],
        drift: [-1.8, 1.7, 1.4],
        rotationRate: [-0.7, 0.9, -0.5],
        settledPos: [-3.4, 1.35, -0.6]
      },
      {
        id: 2,
        title: "Asymmetric Alpha Splinter",
        category: "COGNITIVE DETECTOR",
        tech: "Rust Wasm Shared Thread",
        metrics: "IO Buffer Ops: Peak Capacity",
        desc: "Asymmetrical micro-facet shard balancing coordinates smoothly inside the WebGL canvas viewport.",
        pts: [[-0.5, 1.8], [1.8, 2], [1.0, 0.6], [-1.2, 0.5]],
        centroid: [0.35, 1.25],
        drift: [0.5, 1.9, 1.2],
        rotationRate: [0.6, -0.8, 0.4],
        settledPos: [0.0, 1.35, -0.6]
      },
      {
        id: 3,
        title: "Morphic Edge Fragment",
        category: "EXPERIMENTAL SHOP",
        tech: "Next.js, Tailwind, Shopify",
        metrics: "Conversions: +9.4% | Smooth",
        desc: "High-contrast irregular border fragment designing spatial shopping portals in real-time.",
        pts: [[1.8, 2], [3, 2], [3, 0.8], [1.0, 0.6]],
        centroid: [2.2, 1.35],
        drift: [2.3, 1.6, 0.9],
        rotationRate: [-0.8, 0.7, 0.7],
        settledPos: [3.4, 1.35, -0.6]
      },
      {
        id: 4,
        title: "Vortex Boundary Splinter",
        category: "NEURAL DATA MATRIX",
        tech: "TensorFlow JS Client Models",
        metrics: "Inference: 4.4ms | Secure",
        desc: "Narrow sharp facet processing predictive model layers during high-stress structural crackles.",
        pts: [[3, 0.8], [3, -1], [1.5, -0.4], [1.0, 0.6]],
        centroid: [2.1, 0.15],
        drift: [2.2, -0.2, 0.6],
        rotationRate: [0.5, 0.5, -0.8],
        settledPos: [3.4, -1.35, -0.6]
      },
      {
        id: 5,
        title: "Aura Acoustic Shrapnel",
        category: "PROCEDURAL SPECTRAL NODE",
        tech: "Web Audio Synthesizer Core",
        metrics: "Freq: 8800Hz / High Damping",
        desc: "Highly-damped physical bell strike fragment firing precise pitch trajectories on dispersion.",
        pts: [[3, -1], [3, -2], [0.8, -1.8], [1.5, -0.4]],
        centroid: [2.1, -1.3],
        drift: [1.8, -1.9, 0.8],
        rotationRate: [-0.6, -0.6, 0.5],
        settledPos: [0.0, -1.35, -0.6]
      },
      {
        id: 6,
        title: "Telemetry Asymmetric monitor",
        category: "LOG TRANSIENT ANALYSIS",
        tech: "D3 Engine, Render Workers",
        metrics: "Active Nodes: 1.8M | 60Hz",
        desc: "Asymmetric analytical matrix tracking stress vectors across the glass viewport array.",
        pts: [[1.5, -0.4], [0.8, -1.8], [-1.2, -1.8], [-0.8, -0.5]],
        centroid: [0.1, -1.1],
        drift: [-0.3, -2.1, 1.1],
        rotationRate: [0.8, -0.4, -0.3],
        settledPos: [-3.4, -1.35, -0.6]
      }
    ] as ShardInfo[]
  }
];

// -------------------------------------------------------------
// CROSSHAIR SCANNER
// -------------------------------------------------------------
function CrosshairRenderer({ scrollProgress }: { scrollProgress: number }) {
  const lineRefH = useRef<THREE.LineSegments>(null);
  const lineRefV = useRef<THREE.LineSegments>(null);
  
  useFrame(({ pointer, viewport }) => {
    const isShattered = scrollProgress >= 0.45;
    
    if (lineRefH.current) lineRefH.current.visible = !isShattered;
    if (lineRefV.current) lineRefV.current.visible = !isShattered;
    
    if (isShattered) return;

    // Convert normalized pointer [-1, 1] to 3D Viewport units
    const tx = (pointer.x * viewport.width) / 2;
    const ty = (pointer.y * viewport.height) / 2;

    const lx = THREE.MathUtils.lerp(lineRefV.current ? lineRefV.current.position.x : 0, tx, 0.12);
    const ly = THREE.MathUtils.lerp(lineRefH.current ? lineRefH.current.position.y : 0, ty, 0.12);

    if (lineRefH.current) lineRefH.current.position.set(0, ly, 0.05);
    if (lineRefV.current) lineRefV.current.position.set(lx, 0, 0.05);
  });

  const hPoints = useMemo(() => [new THREE.Vector3(-12, 0, 0), new THREE.Vector3(12, 0, 0)], []);
  const vPoints = useMemo(() => [new THREE.Vector3(0, -12, 0), new THREE.Vector3(0, 12, 0)], []);

  return (
    <group>
      <lineSegments ref={lineRefH} geometry={new THREE.BufferGeometry().setFromPoints(hPoints)}>
        <lineBasicMaterial color="#39FF14" transparent opacity={0.25} />
      </lineSegments>
      <lineSegments ref={lineRefV} geometry={new THREE.BufferGeometry().setFromPoints(vPoints)}>
        <lineBasicMaterial color="#39FF14" transparent opacity={0.25} />
      </lineSegments>
    </group>
  );
}

// -------------------------------------------------------------
// PROCEDURAL STRESS CRACKS SEAMS (0.21 - 0.45)
// -------------------------------------------------------------
function StressCracks({ scrollProgress, cracks }: { scrollProgress: number; cracks: [number, number][][] }) {
  const lineGroupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!lineGroupRef.current) return;
    
    // Crack progress lives strictly between 0.21 and 0.45
    if (scrollProgress < 0.21) {
      lineGroupRef.current.visible = false;
      return;
    }
    if (scrollProgress >= 0.45) {
      lineGroupRef.current.visible = false;
      return;
    }

    lineGroupRef.current.visible = true;
    const progressFactor = (scrollProgress - 0.21) / 0.24; // Normalized 0.0 - 1.0

    // Pulse intensity mimicking high-tension electrical discharges
    const pulse = 0.75 + Math.sin(Date.now() * 0.04) * 0.25;
    const finalOpacity = progressFactor * pulse;

    // Apply properties to the lines group
    lineGroupRef.current.traverse((child) => {
      if (child instanceof THREE.LineSegments) {
        const mat = child.material as THREE.LineBasicMaterial;
        mat.opacity = finalOpacity;
      }
    });
  });

  const linesGeometry = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    cracks.forEach((segment) => {
      pts.push(new THREE.Vector3(segment[0][0], segment[0][1], 0.04));
      pts.push(new THREE.Vector3(segment[1][0], segment[1][1], 0.04));
    });
    const geometry = new THREE.BufferGeometry().setFromPoints(pts);
    return geometry;
  }, [cracks]);

  return (
    <group ref={lineGroupRef}>
      <lineSegments geometry={linesGeometry}>
        <lineBasicMaterial color="#39FF14" transparent opacity={0} linewidth={1.5} />
      </lineSegments>
    </group>
  );
}

// -------------------------------------------------------------
// SINGLE INTERACTIVE GLASS SHARD WITH EMBEDDED DREI HTML
// -------------------------------------------------------------
interface SingleShardProps {
  shard: ShardInfo;
  scrollProgress: number;
  hoveredId: number;
  setHoveredId: (id: number) => void;
}

function SingleShard({ shard, scrollProgress, hoveredId, setHoveredId }: SingleShardProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Build custom polygon geometry
  const glassGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shard.pts.forEach((pt, idx) => {
      // Local offset points by centroid to align the mesh pivot perfectly at centroid
      const lx = pt[0] - shard.centroid[0];
      const ly = pt[1] - shard.centroid[1];
      if (idx === 0) shape.moveTo(lx, ly);
      else shape.lineTo(lx, ly);
    });
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, [shard]);

  // Build outline closed loop points
  const silverOutlinePoints = useMemo(() => {
    const pts = shard.pts.map(pt => new THREE.Vector3(pt[0] - shard.centroid[0], pt[1] - shard.centroid[1], 0.015));
    pts.push(pts[0].clone()); // Close loop
    return pts;
  }, [shard]);

  useFrame(() => {
    if (!groupRef.current) return;

    const p = scrollProgress;
    let tx = shard.centroid[0];
    let ty = shard.centroid[1];
    let tz = 0;

    let rx = 0;
    let ry = 0;
    let rz = 0;

    let targetScale = 1.0;

    if (p < 0.45) {
      // Phase 1 & crack build-up vibration
      if (p > 0.20) {
        const tf = (p - 0.20) / 0.25; // 0 to 1 scaling tension vibration
        const tick = Date.now() * 0.05;
        tx += Math.sin(tick) * 0.005 * tf;
        ty += Math.cos(tick) * 0.005 * tf;
      }
    } else if (p >= 0.45 && p <= 0.65) {
      // Phase 2 Shatter Dispersal
      const t = (p - 0.45) / 0.20; // 0.0 to 1.0

      const finalX = shard.settledPos[0];
      const finalY = shard.settledPos[1];
      const finalZ = shard.settledPos[2];

      const centX = shard.centroid[0];
      const centY = shard.centroid[1];

      // Symmetrical explosive push out along drift axis, fading as they snap to bento grid
      const burstScale = Math.sin(t * Math.PI) * 1.8;

      tx = THREE.MathUtils.lerp(centX, finalX, t) + shard.drift[0] * burstScale;
      ty = THREE.MathUtils.lerp(centY, finalY, t) + shard.drift[1] * burstScale;
      tz = THREE.MathUtils.lerp(0, finalZ, t) + shard.drift[2] * burstScale;

      // Rotation tumble loop that settles beautifully flat
      const rotPulse = Math.sin(t * Math.PI);
      rx = shard.rotationRate[0] * rotPulse * 2.8;
      ry = shard.rotationRate[1] * rotPulse * 2.8;
      rz = shard.rotationRate[2] * rotPulse * 1.5;
    } else {
      // Phase 3 Grid Sifting
      tx = shard.settledPos[0];
      ty = shard.settledPos[1];
      tz = shard.settledPos[2];

      if (hoveredId === shard.id) {
        tz += 1.8; // Draw closer to viewport
        targetScale = 1.08;
      } else if (hoveredId !== -1) {
        tz -= 1.4; // Recede other elements back
        targetScale = 0.86;
      }
    }

    // Spring interpolation to suppress framerate jitter
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, tx, 0.1);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, ty, 0.1);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, tz, 0.1);

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, rx, 0.1);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, ry, 0.1);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, rz, 0.1);

    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.1));
  });

  // Calculate dynamic HTML card visibility
  const showHtml = scrollProgress >= 0.45;
  const htmlOpacity = showHtml ? Math.min((scrollProgress - 0.45) / 0.10, 1.0) : 0;

  // Setup dynamic Depth of Field approximation via CSS filters
  const isAnyHovered = hoveredId !== -1;
  const isSelfHovered = hoveredId === shard.id;

  let filterStyle = "none";
  let componentOpacity = 1.0;

  if (scrollProgress >= 0.66) {
    if (isAnyHovered) {
      filterStyle = isSelfHovered ? "none" : "blur(5px)";
      componentOpacity = isSelfHovered ? 1.0 : 0.25;
    } else {
      filterStyle = "none";
      componentOpacity = 0.95;
    }
  }

  // DoubleSide is essential because during high rotational tumbles we expose back sides
  return (
    <group ref={groupRef}>
      {/* 1. Translucent Physical Glass Mesh */}
      <mesh geometry={glassGeometry}>
        <meshPhysicalMaterial
          transmission={0.85}
          roughness={0.24}
          metalness={0.15}
          thickness={1.2}
          ior={1.48}
          color="#0B0D10"
          transparent
          opacity={0.88}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2. Liquid Silver Polished Wireframe Edge */}
      <lineLoop geometry={new THREE.BufferGeometry().setFromPoints(silverOutlinePoints)}>
        <lineBasicMaterial color="#E2E8F0" transparent opacity={0.55} linewidth={1} />
      </lineLoop>

      {/* 3. Embedded Drei HTML Portfolio Display */}
      {showHtml && (
        <Html
          transform
          distanceFactor={2.7}
          position={[0, 0, 0.05]}
          onPointerOver={() => {
            if (scrollProgress >= 0.66) setHoveredId(shard.id);
          }}
          onPointerOut={() => {
            if (scrollProgress >= 0.66) setHoveredId(-1);
          }}
          className="pointer-events-auto select-none"
          style={{
            width: '320px',
            height: '220px',
            opacity: htmlOpacity * componentOpacity,
            filter: filterStyle,
            transform: `scale(${isSelfHovered ? 1.04 : 1.0})`,
            transition: 'opacity 0.4s ease-out, filter 0.4s ease-out, transform 0.3s ease-out'
          }}
        >
          <div 
            id={`shard-card-${shard.id}`}
            className="relative p-5 rounded-xl border border-[#39FF14]/20 bg-[#0B0D10]/85 backdrop-blur-2xl text-white font-sans flex flex-col justify-between h-full shadow-[0_0_20px_rgba(57,255,20,0.04)] text-left hover:border-[#39FF14]/55 transition-all duration-300 overflow-hidden"
          >
            {/* Ambient Diagonal Gradient highlight from mockup */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#39FF14]/5 pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-start border-b border-[#39FF14]/15 pb-2.5 relative z-10">
              <div>
                <span className="font-mono text-[9px] text-slate-300 opacity-60 tracking-widest block uppercase font-bold">
                  {shard.id === 4 ? "Core System" : shard.id === 1 ? "Build Log 001" : `Project ${String.fromCharCode(64 + shard.id)}`}
                </span>
                <h3 className="font-mono text-[14px] font-extrabold text-[#39FF14] tracking-tight leading-none mt-1">
                  {shard.title.toUpperCase().replace(/ /g, "_")}
                </h3>
              </div>
              <span className="font-mono text-[9px] text-[#39FF14] bg-[#0F3D18]/30 px-2 py-0.5 rounded border border-[#39FF14]/20 font-bold">
                SR_0{shard.id}
              </span>
            </div>

            {/* Description Body */}
            <p className="text-slate-300 text-xs my-1.5 leading-relaxed font-normal relative z-10">
              {shard.desc}
            </p>

            {/* Integrated Custom Data Boxes & Telemetry rows from Mockup Spec */}
            <div className="relative z-10">
              {shard.id === 4 ? (
                /* Animated Real CSS Spectrum Columns */
                <div className="w-full h-12 bg-[#39FF14]/10 flex items-end gap-1.5 p-1.5 rounded border border-[#39FF14]/15 mb-2.5">
                  <div className="flex-1 bg-[#39FF14] h-[40%] animate-pulse"></div>
                  <div className="flex-1 bg-[#39FF14] h-[72%] animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="flex-1 bg-[#39FF14] h-[58%] animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="flex-1 bg-[#39FF14] h-[90%] animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  <div className="flex-1 bg-[#39FF14] h-[32%] animate-pulse" style={{ animationDelay: '0.15s' }}></div>
                  <div className="flex-1 bg-[#39FF14] h-[64%] animate-pulse" style={{ animationDelay: '0.25s' }}></div>
                </div>
              ) : (
                /* Standard dynamic data box layout */
                <div className="mt-1.5 mb-2.5 border-l-2 border-[#39FF14] pl-3 flex flex-col gap-1">
                  {shard.id === 1 && (
                    <>
                      <div className="flex justify-between font-mono text-[10px] text-slate-400 leading-none">
                        <span>Load</span>
                        <span className="text-[#39FF14]">0.44ms</span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px] text-slate-400 leading-none">
                        <span>Heat</span>
                        <span className="text-white">32&deg;C</span>
                      </div>
                    </>
                  )}
                  {shard.id === 2 && (
                    <>
                      <div className="flex justify-between font-mono text-[10px] text-slate-400 leading-none">
                        <span>FPS</span>
                        <span className="text-[#39FF14]">144.0</span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px] text-slate-400 leading-none">
                        <span>Buffer</span>
                        <span className="text-[#39FF14] font-bold">[OK]</span>
                      </div>
                    </>
                  )}
                  {shard.id === 3 && (
                    <div className="flex justify-between font-mono text-[10px] text-slate-400 leading-none">
                      <span>Conversion</span>
                      <span className="text-[#39FF14]">12.4%</span>
                    </div>
                  )}
                  {shard.id === 5 && (
                    <>
                      <div className="flex justify-between font-mono text-[10px] text-slate-400 leading-none">
                        <span>Sample Rate</span>
                        <span className="text-white">44.1kHz</span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px] text-slate-400 leading-none">
                        <span>Latency</span>
                        <span className="text-[#39FF14] font-bold">LOW</span>
                      </div>
                    </>
                  )}
                  {shard.id === 6 && (
                    <>
                      <div className="flex justify-between font-mono text-[10px] text-slate-400 leading-none">
                        <span>Points</span>
                        <span className="text-[#39FF14]">2.5M</span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px] text-slate-400 leading-none">
                        <span>Redraw</span>
                        <span className="text-[#39FF14]">60Hz</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Technologies list */}
              <div className="flex flex-wrap gap-1 mb-2.5">
                {shard.tech.split(', ').map((techItem) => (
                  <span
                    key={techItem}
                    className="text-[8px] font-mono bg-[#0F3D18]/30 text-[#39FF14] border border-[#39FF14]/15 px-1.5 py-0.5 rounded font-bold"
                  >
                    {techItem}
                  </span>
                ))}
              </div>

              {/* High precision telemetry metric array */}
              <div className="flex items-center justify-between font-mono text-[8.5px] text-[#39FF14]/90 bg-[#000000]/80 px-2 py-1.5 rounded border border-[#39FF14]/15">
                <span className="flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-ping"></span>
                  METRICS:
                </span>
                <span className="text-white font-bold tracking-wider">{shard.metrics}</span>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// -------------------------------------------------------------
// DYNAMIC CINEMATIC CAMERA COLLISION SYSTEM
// -------------------------------------------------------------
function CameraFlightController({ scrollProgress }: { scrollProgress: number }) {
  const camLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(({ camera }) => {
    let tx = 0;
    let ty = 0;
    let tz = 6.2; // Back focal distance
    const lookAtTarget = new THREE.Vector3(0, 0, 0);

    if (scrollProgress < 0.45) {
      // Phase 1: Flat centered lock
      tx = 0;
      ty = 0;
      tz = 6.2;
    } else if (scrollProgress >= 0.45 && scrollProgress < 0.66) {
      // Phase 2 Shatter Reaction - Recoil physical kick-back of camera on blast
      const reactionT = (scrollProgress - 0.45) / 0.21;
      const recoilForce = Math.sin(reactionT * Math.PI) * 0.9;
      tx = 0;
      ty = 0;
      tz = 6.2 + recoilForce;
    } else {
      // Phase 3 Deep Sifting - Complex panflight path
      const t = (scrollProgress - 0.66) / 0.34; // Normalized 0-1 camera flight

      // Smooth flight loop
      tx = Math.sin(t * Math.PI * 1.1) * 2.2;
      ty = Math.cos(t * Math.PI * 0.8) * 0.7;
      tz = 6.2 - Math.sin(t * Math.PI) * 0.9;

      // Adjust focal tracking ahead
      lookAtTarget.set(tx * 0.25, ty * 0.25, 0);
    }

    // Smooth frame lerp
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, tx, 0.08);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, ty, 0.08);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, tz, 0.08);

    camLookAt.current.lerp(lookAtTarget, 0.08);
    camera.lookAt(camLookAt.current);
  });

  return null;
}

// -------------------------------------------------------------
// DEEP PARALLAX COLD SPACE GRID LINE MATRIX
// -------------------------------------------------------------
function BackgroundSpaceGrid() {
  const gridPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    // Beautiful massive background grid bounding box projection lines floating at z = -4
    const minX = -10, maxX = 10;
    const minY = -8, maxY = 8;
    const gridDepth = -4.5;
    const divisions = 14;

    for (let i = 0; i <= divisions; i++) {
      const x = minX + (i / divisions) * (maxX - minX);
      pts.push(new THREE.Vector3(x, minY, gridDepth));
      pts.push(new THREE.Vector3(x, maxY, gridDepth));
    }
    for (let j = 0; j <= divisions; j++) {
      const y = minY + (j / divisions) * (maxY - minY);
      pts.push(new THREE.Vector3(minX, y, gridDepth));
      pts.push(new THREE.Vector3(maxX, y, gridDepth));
    }
    return pts;
  }, []);

  return (
    <lineSegments>
      <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints(gridPoints)} />
      <lineBasicMaterial color="#0F3D18" transparent opacity={0.15} />
    </lineSegments>
  );
}

// -------------------------------------------------------------
// PRIMARY GRAPHICS SCENE WRAPPER
// -------------------------------------------------------------
interface WebGLSceneProps {
  scrollProgress: number;
  hoveredId: number;
  setHoveredId: (id: number) => void;
  shards: ShardInfo[];
  cracks: [number, number][][];
}

function WebGLScene({ scrollProgress, hoveredId, setHoveredId, shards, cracks }: WebGLSceneProps) {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <Canvas
        id="gl-canvas-node"
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 6.2], fov: 45 }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[2, 6, 4]} intensity={1.6} />
        <pointLight position={[-4, -4, 2]} intensity={0.7} color="#39FF14" />

        {/* Parallax depth grid */}
        <BackgroundSpaceGrid />

        {/* Cursor tracking laser crosshairs */}
        <CrosshairRenderer scrollProgress={scrollProgress} />

        {/* Dynamic Glowing cracks propagating on joints */}
        <StressCracks scrollProgress={scrollProgress} cracks={cracks} />

        {/* Dynamically mapped Fragment elements */}
        {shards.map((shard) => (
          <SingleShard
            key={shard.id}
            shard={shard}
            scrollProgress={scrollProgress}
            hoveredId={hoveredId}
            setHoveredId={setHoveredId}
          />
        ))}

        {/* Real-time Bezier camera director system */}
        <CameraFlightController scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}

// -------------------------------------------------------------
// PRIMARY ROOT EXPORT COMPONENT
// -------------------------------------------------------------
export default function App() {
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [muted, setMuted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [shatteredState, setShatteredState] = useState(false);
  const [hoveredId, setHoveredId] = useState(-1);
  const [activePreset, setActivePreset] = useState(0);

  const currentShards = useMemo(() => PRESETS_DATA[activePreset].shards, [activePreset]);
  const currentCracks = useMemo(() => PRESETS_DATA[activePreset].cracks, [activePreset]);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggeredMilestones = useRef<Record<number, boolean>>({});
  const initialLockTriggered = useRef(false);

  // Synchronize ScrollTrigger hooks
  useLayoutEffect(() => {
    // Scroll track initialization over 600vh height
    const scrollTriggerInstance = ScrollTrigger.create({
      trigger: "#scroll-track",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.0,
      onUpdate: (self) => {
        const progress = parseFloat(self.progress.toFixed(4));
        setScrollProgress(progress);

        if (!audioUnlocked) return;

        // Dynamic pressure hum frequency modulation sweep
        audioEngine.updateHumTension(progress);

        // Snap sound triggering markers
        const snapMilestones = [0.22, 0.25, 0.28, 0.31, 0.34, 0.37, 0.40, 0.42, 0.43, 0.44];
        snapMilestones.forEach((m) => {
          if (progress >= m && !triggeredMilestones.current[m]) {
            triggeredMilestones.current[m] = true;
            if (!muted) {
              audioEngine.playGlassSnap();
            }
          } else if (progress < m - 0.02 && triggeredMilestones.current[m]) {
            // Recoil Reset so user can snap them again in both trace scroll directions
            triggeredMilestones.current[m] = false;
          }
        });

        // Atomic shattering point trigger (0.45)
        if (progress >= 0.45 && !initialLockTriggered.current) {
          initialLockTriggered.current = true;
          setShatteredState(true);
          if (!muted) {
            audioEngine.playShatterBurst(activePreset);
          }
          audioEngine.stopHum();
        } else if (progress < 0.42 && initialLockTriggered.current) {
          // Reunite seamless monolith configuration
          initialLockTriggered.current = false;
          setShatteredState(false);
          audioEngine.startHum();
        }
      }
    });

    return () => {
      scrollTriggerInstance.kill();
      audioEngine.stopHum();
    };
  }, [audioUnlocked, muted, activePreset]);

  // Unlock and play core Web Audio
  const handleInitiateDrive = () => {
    audioEngine.init();
    audioEngine.startHum();
    setAudioUnlocked(true);
  };

  // Sound muting toggles
  const handleMuteToggle = () => {
    if (muted) {
      audioEngine.startHum();
      setMuted(false);
    } else {
      audioEngine.stopHum();
      setMuted(true);
    }
  };

  const activePhase = useMemo(() => {
    if (scrollProgress < 0.21) return 1;
    if (scrollProgress < 0.66) return 2;
    return 3;
  }, [scrollProgress]);

  return (
    <div ref={containerRef} className="relative bg-[#000000] text-white w-full min-h-screen select-none overflow-x-hidden">
      
      {/* -------------------------------------------------------------
          1. WEB AUDIO API OVERLAY HUD
          ------------------------------------------------------------- */}
      {!audioUnlocked && (
        <div className="fixed inset-0 w-full h-full bg-[#000000]/95 backdrop-blur-2xl z-50 flex flex-col justify-center items-center p-6 text-center">
          <div className="max-w-md p-8 rounded-2xl border border-[#39FF14]/15 bg-[#0B0D10]/80 shadow-[0_0_50px_rgba(57,255,20,0.05)]">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full border border-[#39FF14]/20 bg-[#0F3D18]/20 flex items-center justify-center text-[#39FF14] animate-pulse">
                <Layers className="w-8 h-8" />
              </div>
            </div>
            
            <h1 className="font-sans text-2xl font-bold tracking-tight text-white mb-2 uppercase">
              Zexan Glass Shatter
            </h1>
            <p className="font-mono text-[9px] text-[#39FF14]/80 tracking-widest block uppercase mb-4">
              [SYSTEM_DRIVE: READY_TO_LOAD]
            </p>
            <p className="text-slate-400 text-xs leading-relaxed mb-6 font-normal">
              This interactive scroll experience synthesizes physical crystalline tension acoustics and high-precision 3D geometry fragments directly using WebGL and Web Audio parameters.
            </p>
            
            <button
              id="init-button"
              onClick={handleInitiateDrive}
              className="cursor-pointer w-full py-3.5 px-6 rounded-lg font-mono text-xs font-bold bg-[#39FF14] text-[#000000] hover:bg-white hover:text-[#000000] transition-colors duration-300 border border-[#39FF14]/30 shadow-[0_0_20px_rgba(57,255,20,0.3)] tracking-widest uppercase flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              INITIALIZE STRUCTURAL DRIVE
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          2. SCROLL TRACK (600vh scroll workspace)
          ------------------------------------------------------------- */}
      <div id="scroll-track" className="relative w-full h-[600vh]">
        
        {/* Fixed Frame Wrapper Viewport */}
        <div className="fixed inset-0 w-full h-screen overflow-hidden z-20 pointer-events-none">
          
          {/* AMOLED Background base filter & High Precision Grid Overlay from Artistic Flair mockup */}
          <div className="absolute inset-0 bg-[#000000] z-0" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(226,232,240,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,232,240,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-10" />

          {/* Interactive WebGL Scene */}
          <WebGLScene
            scrollProgress={scrollProgress}
            hoveredId={hoveredId}
            setHoveredId={setHoveredId}
            shards={currentShards}
            cracks={currentCracks}
          />

          {/* -------------------------------------------------------------
              3. GLASS HUD MARGIN WRAPPER RENDER
              ------------------------------------------------------------- */}
          
          {/* Header HUD - Direct from Artistic Flair Design */}
          <div className="absolute top-0 inset-x-0 p-8 flex justify-between items-start z-30 pointer-events-auto bg-gradient-to-b from-[#000000]/90 via-[#000000]/30 to-transparent">
            {/* Left Wing */}
            <div className="flex flex-col">
              <div className="mb-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#39FF14] border border-[#39FF14]/40 px-2.5 py-1 bg-[#0F3D18]/30 inline-block rounded font-bold">
                  System Active
                </span>
              </div>
              <h1 className="font-sans text-3xl md:text-4xl font-black tracking-tighter text-white leading-none">
                ZEXAN GLASS SHATTER
              </h1>
              <span className="font-mono text-[10px] text-slate-400 opacity-70 uppercase block mt-1.5">
                Coord: 52.3676 / 4.9041 &bull; PHASE: {activePhase === 1 ? "MONOLITH_LOCK" : activePhase === 2 ? "FRACTURE_STRESS" : "DEEP_SIFT"}
              </span>

              {/* Dynamic Preset Switcher Panel */}
              <div className="mt-4 flex gap-1.5 items-center pointer-events-auto bg-[#0B0D10]/85 p-1.5 rounded-lg border border-[#39FF14]/20 shadow-[0_0_15px_rgba(57,255,20,0.08)] max-w-fit">
                <span className="font-mono text-[8px] text-[#39FF14] font-bold uppercase tracking-wider mr-1">[FX_ENGINE_PRESETS]:</span>
                {PRESETS_DATA.map((p, idx) => (
                  <button
                    key={p.name}
                    id={`preset-btn-${idx}`}
                    onClick={() => {
                      setActivePreset(idx);
                      if (!muted && audioUnlocked) {
                        audioEngine.playGlassSnap();
                      }
                    }}
                    className={`cursor-pointer font-mono text-[8px] px-2.5 py-1 rounded transition-all duration-150 border uppercase ${
                      activePreset === idx 
                        ? 'bg-[#39FF14] text-black border-[#39FF14] font-black' 
                        : 'bg-transparent text-slate-400 border-slate-800/80 hover:border-[#39FF14]/40 hover:text-white'
                    }`}
                  >
                    {p.name.slice(3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Wing */}
            <div className="text-right flex flex-col items-end gap-1">
              {/* Mute controller */}
              {audioUnlocked && (
                <button
                  id="mute-button"
                  onClick={handleMuteToggle}
                  className="cursor-pointer font-mono text-[9px] text-[#39FF14] border border-[#39FF14]/20 hover:border-[#39FF14]/60 bg-[#0B0D10]/90 rounded px-3 py-1 flex items-center gap-1.5 transition-all mb-2 shadow-[0_0_15px_rgba(57,255,20,0.1)]"
                >
                  {muted ? (
                    <>
                      <VolumeX className="w-3 h-3 text-slate-500" />
                      <span>OFFLINE</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3 h-3 text-[#39FF14] animate-bounce" />
                      <span>SYNTH_ON</span>
                    </>
                  )}
                </button>
              )}
              
              <div className="font-mono text-[10px] text-slate-400 opacity-60 uppercase leading-none">
                Structural Integrity
              </div>
              <div 
                className="font-sans text-3xl font-black text-[#39FF14] tracking-tight transition-all duration-300"
                style={{ textShadow: '0 0 10px rgba(57,255,20,0.45)' }}
              >
                {(scrollProgress < 0.21 ? 100 : Math.max(100 - (scrollProgress - 0.21) * 150, 18.4)).toFixed(1)}%
              </div>
              <div className="font-mono text-[9px] text-[#39FF14]/70 opacity-80 uppercase font-bold">
                Phase: {activePhase === 1 ? "Monolith Rig" : activePhase === 2 ? "Dispersal" : "Grid Sift"}
              </div>
            </div>
          </div>

          {/* Center Monolith HUD Labels (Only visible prior to complete break) */}
          {scrollProgress < 0.45 && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-10 flex flex-col justify-center items-center text-center pointer-events-none">
              <div className="max-w-xl px-6 py-4 rounded-xl border border-[#39FF14]/15 bg-[#0B0D10]/80 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex flex-col items-center">
                <h2 className="font-mono text-[11px] text-[#39FF14] tracking-[0.35em] uppercase font-bold animate-pulse">
                  [ENGAGE_STRUCTURAL_STRESS]
                </h2>
                <div className="w-[180px] h-0.5 bg-gradient-to-r from-transparent via-[#39FF14]/30 to-transparent my-3" />
                <p className="text-white text-base font-bold tracking-tight font-sans uppercase mb-1">
                  System Ready to Evoke
                </p>
                
                {/* Scroll Indicator */}
                <div className="flex flex-col items-center mt-4">
                  <span className="font-mono text-[9px] text-[#39FF14]/80 tracking-widest uppercase animate-bounce">
                    Scroll Down to Crack
                  </span>
                  <div className="w-5 h-8 rounded-full border border-slate-700 mt-2 flex justify-center p-1">
                    <div className="w-1 h-2 bg-[#39FF14] rounded-full animate-scroll-motion" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* High precision telemetry indicator overlay floating bottom - Direct from Artistic Flair Design */}
          <div className="absolute bottom-0 inset-x-0 p-6 z-30 pointer-events-auto flex justify-between items-center border-t border-[#39FF14]/10 bg-gradient-to-t from-[#000000]/95 via-[#000000]/40 to-transparent">
            <div className="font-mono text-[9px] text-slate-500 text-left">
              <span className="text-slate-400 font-bold">[ ENGAGE_STRUCTURAL_STRESS ]</span> &mdash; MANUAL_OVERRIDE_ENABLED
            </div>

            {/* Manual Scroll indicator feedback block */}
            <div className="flex items-center gap-6">
              <div className="font-mono text-[9px] text-slate-300">
                SCROLL PROGRESS: <span className="text-[#39FF14] font-bold">{(scrollProgress * 100).toFixed(1)}%</span>
              </div>
              <div className="relative w-40 h-1 bg-[#0F3D18]/30 border border-[#39FF14]/20 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 bottom-0 bg-[#39FF14] transition-all duration-75 shadow-[0_0_8px_#39FF14]"
                  style={{ width: `${scrollProgress * 100}%` }}
                />
              </div>
            </div>

            <div className="font-mono text-[9px] text-slate-500 text-right font-bold">
              STABLE_FRAGMENTS: {currentShards.length.toString().padStart(2, '0')} // SYNC_STATUS: NOMINAL
            </div>
          </div>

        </div>
      </div>

      {/* -------------------------------------------------------------
          4. CUSTOM CSS STYLING OVERRIDES
          ------------------------------------------------------------- */}
      <style>{`
        /* custom scrollbar hidden to preserve total cinematic canvas depth */
        ::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        ::-webkit-scrollbar-track {
          background: #000000;
        }
        ::-webkit-scrollbar-thumb {
          background: #0F3D18;
          border-radius: 9px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #39FF14;
        }

        /* Mouse Scroll indicator animation parameter */
        @keyframes scroll-motion {
          0% { transform: translateY(0); opacity: 0; }
          40% { opacity: 1; }
          90% { transform: translateY(6px); opacity: 0; }
          100% { transform: translateY(0); opacity: 0; }
        }
        .animate-scroll-motion {
          animation: scroll-motion 1.8s ease-in-out infinite;
        }
      `}</style>

    </div>
  );
}
