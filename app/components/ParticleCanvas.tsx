"use client";

import { useEffect, useRef } from "react";

const START_DATE = new Date("August 18, 2026 00:00:00");
const TARGET_DATE = new Date("November 16, 2026 19:30:00");

interface DustParticle {
  x: number;
  y: number;
  baseSize: number;
  baseVx: number;
  baseVy: number;
  alpha: number;
  fadeSpeed: number;
  fadingOut: boolean;
  angle: number;
  colorShift: number;
}

let particleCount = 100;
let onParticleCountChange: (() => void) | null = null;

export function getParticleCount() {
  return particleCount;
}

export function setParticleCount(count: number) {
  particleCount = Math.max(10, Math.min(2000, count));
  onParticleCountChange?.();
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<DustParticle[]>([]);
  const animationRef = useRef<number>(0);

  function calculateDynamicParticleCount() {
    const now = new Date();
    const maxParticles = 1000;
    const minParticles = 50;

    if (now >= TARGET_DATE) return maxParticles;

    const totalSpan = TARGET_DATE.getTime() - START_DATE.getTime();
    const elapsed = now.getTime() - START_DATE.getTime();
    const progress = elapsed / totalSpan;
    const eased = Math.pow(Math.min(Math.max(progress, 0), 1), 3);

    return Math.floor(minParticles + eased * (maxParticles - minParticles));
  }

  // ⭐ PARTICLE SYSTEM
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const createParticle = (initial = false): DustParticle => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      baseSize: Math.random() * 1.5 + 0.1,
      baseVx: (Math.random() - 0.5) * 0.15,
      baseVy: (Math.random() - 0.5) * 0.15 - 0.05,
      alpha: initial ? Math.random() * 0.6 : 0,
      fadeSpeed: Math.random() * 0.002 + 0.001,
      fadingOut: Math.random() > 0.5,
      angle: Math.random() * Math.PI * 2,
      colorShift: Math.random() * 40,
    });

    const resetParticle = (p: DustParticle) => {
      p.x = Math.random() * window.innerWidth;
      p.y = Math.random() * window.innerHeight;
      p.baseSize = Math.random() * 1.5 + 0.1;
      p.baseVx = (Math.random() - 0.5) * 0.15;
      p.baseVy = (Math.random() - 0.5) * 0.15 - 0.05;
      p.alpha = 0;
      p.fadeSpeed = Math.random() * 0.002 + 0.001;
      p.fadingOut = false;
      p.angle = Math.random() * Math.PI * 2;
    };

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particleCount = calculateDynamicParticleCount();
      particlesRef.current = Array.from(
        { length: particleCount },
        () => createParticle(true)
      );
    };

    onParticleCountChange = init;

    const animate = () => {
      const targetCount = calculateDynamicParticleCount();

      if (targetCount !== particleCount) {
        particleCount = targetCount;
        particlesRef.current = Array.from(
          { length: particleCount },
          () => createParticle(true)
        );
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const scaleFactor = Math.min(window.innerWidth, window.innerHeight) / 1000;

      particlesRef.current.forEach((p) => {
        p.angle += 0.005;
        p.x += p.baseVx * scaleFactor + Math.sin(p.angle) * (0.1 * scaleFactor);
        p.y += p.baseVy * scaleFactor;

        if (
          p.x < 0 ||
          p.x > window.innerWidth ||
          p.y < 0 ||
          p.y > window.innerHeight
        ) {
          resetParticle(p);
        }

        if (p.fadingOut) {
          p.alpha -= p.fadeSpeed;
          if (p.alpha <= 0) {
            p.fadingOut = false;
            resetParticle(p);
          }
        } else {
          p.alpha += p.fadeSpeed;
          if (p.alpha >= 0.7) p.fadingOut = true;
        }

        const r = p.baseSize * scaleFactor;

        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          r * 2
        );

        gradient.addColorStop(0, `rgba(255, 255, 200, ${p.alpha})`);
        gradient.addColorStop(1, `rgba(255, 215, 0, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 2, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleResize = () => init();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationRef.current);
      onParticleCountChange = null;
    };
  }, []);

  // ⭐ QUADRANT-BASED LOOP DETECTOR (RELIABLE)
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let tracking = false;

    let quadrantSequence: number[] = [];
    let circleCount = 0;

    const getQuadrant = (x: number, y: number) => {
      const dx = x - startX;
      const dy = y - startY;

      if (dx >= 0 && dy < 0) return 1;  // top-right
      if (dx < 0 && dy < 0) return 2;   // top-left
      if (dx < 0 && dy >= 0) return 3;  // bottom-left
      return 4;                         // bottom-right
    };

    const handler = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      if (!tracking) {
        tracking = true;
        startX = x;
        startY = y;
        quadrantSequence = [];
        return;
      }

      const q = getQuadrant(x, y);

      if (quadrantSequence[quadrantSequence.length - 1] !== q) {
        quadrantSequence.push(q);
      }

      // ⭐ Detect clockwise loop: 1 → 4 → 3 → 2 → 1
      const clockwisePattern = [1, 4, 3, 2, 1];

      if (quadrantSequence.join(",").includes(clockwisePattern.join(","))) {
        circleCount++;

        if (circleCount >= 9) {
          setParticleCount(getParticleCount() + 300);
          circleCount = 0;
        }

        tracking = false;
      }
    };

    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="particle-canvas absolute inset-0 z-[8] pointer-events-none"
    />
  );
}
