import React, { useRef, useEffect } from 'react';

// Simple animated canvas particles for hero background
const NUM_PARTICLES = 18;
const COLORS = ['#00bfae', '#00e5ff', '#b2ebf2', '#008080', '#43a047'];

export const HeroParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    // Generate random particles
    const particles = Array.from({ length: NUM_PARTICLES }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      r: 8 + Math.random() * 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      phase: Math.random() * Math.PI * 2,
    }));

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      for (const p of particles) {
        // Animate floating
        const floatY = Math.sin(Date.now() / 1200 + p.phase) * 8;
        ctx.globalAlpha = 0.18;
        ctx.beginPath();
        ctx.arc(p.x, p.y + floatY, p.r, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.globalAlpha = 1;
        // Move
        p.x += p.dx;
        p.y += p.dy;
        // Bounce off edges
        if (p.x < p.r || p.x > (canvas?.offsetWidth ?? 0) - p.r) p.dx *= -1;
        if (p.y < p.r || p.y > (canvas?.offsetHeight ?? 0) - p.r) p.dy *= -1;
      }
      animationFrameId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={260}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}; 