import React, { useEffect, useRef } from "react";

interface ConfettiCanvasProps {
  active: boolean;
  onComplete?: () => void;
  reducedMotion?: boolean;
  durationMs?: number;
  containerElement?: HTMLElement | null;
  /** When used inside a simulated mockup container */
  isMockup?: boolean;
  /** Speed multiplier (default 1.0 = gentle & floaty) */
  speedMultiplier?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  shape: "rounded-rect" | "circle" | "streamer" | "star" | "ribbon" | "heart";
  opacity: number;
  aspectRatio: number;
  drag: number;
  gravity: number;
  swayFreq: number;
  swayAmp: number;
  swayPhase: number;
  curlPhase: number;
  spawnDelayMs: number;
  type: "cannon-left" | "cannon-right" | "top-drift";
}

// Balanced Lively Rainbow Palette on Deep Navy (#042C51)
// Red, Coral, Orange, Golden Yellow, Lime, Emerald, Teal, Sky Blue, Royal Blue, Violet, Pink, White
const RAINBOW_CONFETTI_PALETTE = [
  "#EF4444", // Red
  "#F87171", // Coral
  "#FF5C28", // SiBS Primary Orange
  "#FBBF24", // Golden Yellow
  "#FACC15", // Bright Warm Yellow
  "#A3E635", // Lime
  "#10B981", // Emerald
  "#14B8A6", // Teal
  "#38BDF8", // Sky Blue
  "#3B82F6", // Royal Blue
  "#8B5CF6", // Violet / Purple
  "#EC4899", // Pink
  "#F472B6", // Soft Pink
  "#FFFFFF", // Crisp White
];

export default function ConfettiCanvas({
  active,
  onComplete,
  reducedMotion = false,
  durationMs = 4200,
  containerElement,
  isMockup = false,
  speedMultiplier = 1.0,
}: ConfettiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active || reducedMotion) {
      if (onComplete) onComplete();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const startTime = performance.now();

    const getDimensions = () => {
      if (isMockup && containerElement) {
        return {
          width: containerElement.clientWidth,
          height: containerElement.clientHeight,
        };
      }
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    };

    const updateSize = () => {
      const { width, height } = getDimensions();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    updateSize();
    const { width: currentW, height: currentH } = getDimensions();

    const isMobile = currentW < 640;
    // Calibrated particle counts for smooth floaty performance
    const countPerSide = isMobile ? 36 : 72;
    const countTopDrift = isMobile ? 24 : 48;

    const particles: Particle[] = [];
    const shapes: Array<"rounded-rect" | "circle" | "streamer" | "star" | "ribbon" | "heart"> = [
      "rounded-rect",
      "rounded-rect",
      "streamer",
      "circle",
      "star",
      "ribbon",
      "heart",
    ];

    // Helper: Draw 4-point star
    const drawStar = (context: CanvasRenderingContext2D, size: number) => {
      const spikes = 4;
      const outerRadius = size * 0.75;
      const innerRadius = size * 0.28;
      let rot = (Math.PI / 2) * 3;
      let x = 0;
      let y = 0;
      const step = Math.PI / spikes;

      context.beginPath();
      context.moveTo(0, -outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = Math.cos(rot) * outerRadius;
        y = Math.sin(rot) * outerRadius;
        context.lineTo(x, y);
        rot += step;

        x = Math.cos(rot) * innerRadius;
        y = Math.sin(rot) * innerRadius;
        context.lineTo(x, y);
        rot += step;
      }
      context.lineTo(0, -outerRadius);
      context.closePath();
      context.fill();
    };

    // Helper: Draw tiny cute heart
    const drawHeart = (context: CanvasRenderingContext2D, size: number) => {
      const s = size * 0.55;
      context.beginPath();
      context.moveTo(0, s * 0.3);
      context.bezierCurveTo(-s * 0.6, -s * 0.5, -s * 1.1, s * 0.2, 0, s * 1.1);
      context.bezierCurveTo(s * 1.1, s * 0.2, s * 0.6, -s * 0.5, 0, s * 0.3);
      context.closePath();
      context.fill();
    };

    // Helper: Draw rounded rectangle
    const drawRoundedRect = (
      context: CanvasRenderingContext2D,
      w: number,
      h: number,
      r: number
    ) => {
      const rad = Math.min(r, w / 2, h / 2);
      context.beginPath();
      context.moveTo(-w / 2 + rad, -h / 2);
      context.lineTo(w / 2 - rad, -h / 2);
      context.arcTo(w / 2, -h / 2, w / 2, h / 2, rad);
      context.lineTo(w / 2, h / 2 - rad);
      context.arcTo(w / 2, h / 2, -w / 2, h / 2, rad);
      context.lineTo(-w / 2 + rad, h / 2);
      context.arcTo(-w / 2, h / 2, -w / 2, -h / 2, rad);
      context.lineTo(-w / 2, -h / 2 + rad);
      context.arcTo(-w / 2, -h / 2, w / 2, -h / 2, rad);
      context.closePath();
      context.fill();
    };

    // Helper: Draw curled streamer
    const drawStreamer = (
      context: CanvasRenderingContext2D,
      length: number,
      width: number,
      curlPhase: number
    ) => {
      const wave = Math.sin(curlPhase) * (width * 0.8);
      context.beginPath();
      context.moveTo(-width / 2, -length / 2);
      context.quadraticCurveTo(wave, 0, -width / 2, length / 2);
      context.lineTo(width / 2, length / 2);
      context.quadraticCurveTo(wave + width, 0, width / 2, -length / 2);
      context.closePath();
      context.fill();
    };

    const speedScale = Math.max(0.2, speedMultiplier);

    // 1. Left Cannon (Gentle high arc up towards center-right, then slow flutter)
    for (let i = 0; i < countPerSide; i++) {
      // Steep upward angle (40 to 76 deg) so it lofts gracefully into the air
      const angle = (Math.PI / 180) * (40 + Math.random() * 36);
      // Gentle initial launch speed (approx 7 to 13 px/frame instead of 18-34)
      const baseSpeed = isMobile ? 6.5 + Math.random() * 4.5 : 8.5 + Math.random() * 5.5;
      const speed = baseSpeed * speedScale;
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const color = RAINBOW_CONFETTI_PALETTE[Math.floor(Math.random() * RAINBOW_CONFETTI_PALETTE.length)];
      const delay = Math.random() * 250; // Staggered start

      particles.push({
        x: Math.random() * 50,
        y: currentH * 0.65 + Math.random() * (currentH * 0.30),
        vx: Math.cos(angle) * speed,
        vy: -Math.sin(angle) * speed,
        size: shape === "heart" ? 7 + Math.random() * 5 : 5 + Math.random() * 7,
        color,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 3.5 * speedScale, // Gentle tumbling
        shape,
        opacity: 1,
        aspectRatio: shape === "streamer" ? 2.8 + Math.random() * 1.8 : 1 + Math.random() * 0.7,
        drag: 0.978, // Cushioned deceleration into floaty state
        gravity: (0.075 + Math.random() * 0.04) * speedScale, // Very light paper gravity
        swayFreq: 0.0018 + Math.random() * 0.002,
        swayAmp: 1.6 + Math.random() * 1.8,
        swayPhase: Math.random() * Math.PI * 2,
        curlPhase: Math.random() * Math.PI * 2,
        spawnDelayMs: delay,
        type: "cannon-left",
      });
    }

    // 2. Right Cannon (Gentle high arc up towards center-left, then slow flutter)
    for (let i = 0; i < countPerSide; i++) {
      // Steep upward angle (104 to 140 deg)
      const angle = (Math.PI / 180) * (104 + Math.random() * 36);
      const baseSpeed = isMobile ? 6.5 + Math.random() * 4.5 : 8.5 + Math.random() * 5.5;
      const speed = baseSpeed * speedScale;
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const color = RAINBOW_CONFETTI_PALETTE[Math.floor(Math.random() * RAINBOW_CONFETTI_PALETTE.length)];
      const delay = Math.random() * 250;

      particles.push({
        x: currentW - Math.random() * 50,
        y: currentH * 0.65 + Math.random() * (currentH * 0.30),
        vx: Math.cos(angle) * speed,
        vy: -Math.sin(angle) * speed,
        size: shape === "heart" ? 7 + Math.random() * 5 : 5 + Math.random() * 7,
        color,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 3.5 * speedScale,
        shape,
        opacity: 1,
        aspectRatio: shape === "streamer" ? 2.8 + Math.random() * 1.8 : 1 + Math.random() * 0.7,
        drag: 0.978,
        gravity: (0.075 + Math.random() * 0.04) * speedScale,
        swayFreq: 0.0018 + Math.random() * 0.002,
        swayAmp: 1.6 + Math.random() * 1.8,
        swayPhase: Math.random() * Math.PI * 2,
        curlPhase: Math.random() * Math.PI * 2,
        spawnDelayMs: delay,
        type: "cannon-right",
      });
    }

    // 3. Top Drift Shower (Fluttering gently and slowly down like snow/petals)
    for (let i = 0; i < countTopDrift; i++) {
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const color = RAINBOW_CONFETTI_PALETTE[Math.floor(Math.random() * RAINBOW_CONFETTI_PALETTE.length)];
      const isLeft = Math.random() > 0.5;
      const spawnX = isLeft
        ? Math.random() * (currentW * 0.38)
        : currentW * 0.62 + Math.random() * (currentW * 0.38);

      const delay = Math.random() * 1200; // Continuous gentle trickling shower

      particles.push({
        x: spawnX,
        y: -15 - Math.random() * 60,
        vx: (Math.random() - 0.5) * 1.2 * speedScale,
        vy: (0.45 + Math.random() * 0.85) * speedScale, // Very slow downward drift
        size: shape === "heart" ? 6 + Math.random() * 4 : 4 + Math.random() * 6,
        color,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2.8 * speedScale,
        shape,
        opacity: 1,
        aspectRatio: shape === "streamer" ? 2.6 + Math.random() * 1.4 : 1 + Math.random() * 0.5,
        drag: 0.992,
        gravity: (0.025 + Math.random() * 0.025) * speedScale, // Ultra light flutter gravity
        swayFreq: 0.0016 + Math.random() * 0.0018,
        swayAmp: 2.0 + Math.random() * 2.2,
        swayPhase: Math.random() * Math.PI * 2,
        curlPhase: Math.random() * Math.PI * 2,
        spawnDelayMs: delay,
        type: "top-drift",
      });
    }

    // Clearer zone immediately around center text
    const centerX = currentW / 2;
    const centerY = currentH / 2;
    const textAvoidRadius = Math.min(currentW, currentH) * 0.22;

    const render = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const { width: renderW, height: renderH } = getDimensions();

      ctx.clearRect(0, 0, renderW, renderH);

      let aliveCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Skip particles whose staggered release hasn't arrived
        if (elapsed < p.spawnDelayMs) {
          aliveCount++;
          continue;
        }

        // Physics motion with organic air flutter
        if (p.type === "top-drift") {
          const sway = Math.sin(now * p.swayFreq + p.swayPhase) * (p.swayAmp * speedScale);
          p.x += sway + p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
        } else {
          p.vx *= p.drag;
          p.vy = p.vy * p.drag + p.gravity;
          // Organic gentle air drift during descent
          const sway = Math.sin(now * p.swayFreq + p.swayPhase) * (p.swayAmp * 0.35 * speedScale);
          p.x += p.vx + sway;
          p.y += p.vy;
        }

        p.rotation += p.rotationSpeed;
        p.curlPhase += 0.025 * speedScale;

        // Gentle soft radial repulsion to keep center greeting zone crisp and legible
        const dx = p.x - centerX;
        const dy = p.y - centerY;
        const dist = Math.hypot(dx, dy);
        if (dist < textAvoidRadius && dist > 1) {
          const push = (1 - dist / textAvoidRadius) * 0.5 * speedScale;
          p.x += (dx / dist) * push;
          p.y += (dy / dist) * push;
        }

        // Slow smooth fade out during final 25% of lifetime (~3.2s to 4.2s)
        if (progress > 0.75) {
          const fadeProg = (progress - 0.75) / 0.25;
          p.opacity = Math.max(0, 1 - fadeProg);
        }

        if (p.opacity > 0 && p.y < renderH + 60 && p.x > -60 && p.x < renderW + 60) {
          aliveCount++;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;

          if (p.shape === "circle") {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.shape === "heart") {
            drawHeart(ctx, p.size);
          } else if (p.shape === "star") {
            drawStar(ctx, p.size);
          } else if (p.shape === "streamer") {
            drawStreamer(ctx, p.size * p.aspectRatio, p.size * 0.45, p.curlPhase);
          } else if (p.shape === "ribbon") {
            ctx.fillRect(
              -p.size * 0.25,
              (-p.size * p.aspectRatio) / 2,
              p.size * 0.5,
              p.size * p.aspectRatio
            );
          } else {
            // Rounded rectangle
            drawRoundedRect(
              ctx,
              p.size,
              p.size * p.aspectRatio,
              Math.min(2.5, p.size * 0.25)
            );
          }

          ctx.restore();
        }
      }

      if (progress < 1 && aliveCount > 0) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, renderW, renderH);
        if (onComplete) onComplete();
      }
    };

    animationFrameId = requestAnimationFrame(render);

    const handleResize = () => {
      updateSize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (ctx) {
        ctx.clearRect(0, 0, currentW, currentH);
      }
    };
  }, [active, reducedMotion, durationMs, onComplete, containerElement, isMockup, speedMultiplier]);

  if (reducedMotion || !active) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`${
        isMockup ? "absolute inset-0" : "fixed inset-0"
      } pointer-events-none z-50 overflow-hidden select-none`}
      style={{ width: "100%", height: "100%" }}
      aria-hidden="true"
    />
  );
}
