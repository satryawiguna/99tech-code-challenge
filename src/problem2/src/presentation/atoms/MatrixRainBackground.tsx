"use client";

import { useEffect, useRef } from "react";

/**
 * Purely decorative background animation — no business meaning, local
 * DOM/canvas state only. Rendered behind all content (z-index 0, fixed,
 * pointer-events: none) so it never intercepts clicks or affects layout.
 * Uses the app's own accent color rather than the classic green, to stay
 * visually consistent with the rest of Nocturne's palette.
 *
 * Respects `prefers-reduced-motion`: renders nothing (not even a static
 * frame) when the user has that preference set.
 */
export function MatrixRainBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const glyphs = "01アイウエオカキクケコサシスセソ0123456789".split("");
    const fontSize = 16;
    let columns = 0;
    let drops: number[] = [];

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = new Array(columns).fill(0).map(() => Math.floor(Math.random() * -50));
    }
    resize();
    window.addEventListener("resize", resize);

    // Row advancement is throttled by elapsed time, not by frame count, so
    // the fall speed is slow and consistent regardless of display refresh
    // rate. The trail-fade fill still repaints every frame so the motion
    // between row advances reads as a smooth fade rather than a choppy jump.
    const rowIntervalMs = 110;
    let lastRowAt = 0;
    let frameId: number;

    function draw(timestamp: number) {
      if (!ctx || !canvas) return;
      ctx.fillStyle = "rgba(22, 24, 38, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (timestamp - lastRowAt >= rowIntervalMs) {
        lastRowAt = timestamp;
        ctx.font = `${fontSize}px monospace`;
        for (let i = 0; i < drops.length; i++) {
          const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
          const y = drops[i] * fontSize;
          ctx.fillStyle =
            y < fontSize * 2 ? "rgba(233, 233, 237, 0.7)" : "rgba(145, 132, 217, 0.55)";
          ctx.fillText(glyph, i * fontSize, y);
          if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
          drops[i]++;
        }
      }
      frameId = requestAnimationFrame(draw);
    }
    frameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.35 }}
    />
  );
}
