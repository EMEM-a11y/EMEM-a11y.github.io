import { useEffect, useRef } from "react";

type TrailParticle = {
  age: number;
  colorIndex: number;
  life: number;
  radius: number;
  rotation: number;
  spin: number;
  stretch: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
};

const trailColors = [
  [152, 113, 154],
  [183, 167, 214],
  [211, 196, 218],
] as const;

function createGlowSprite(color: readonly [number, number, number]) {
  const sprite = document.createElement("canvas");
  sprite.width = 128;
  sprite.height = 128;
  const context = sprite.getContext("2d");
  if (!context) return sprite;

  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.56)`);
  gradient.addColorStop(0.34, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.3)`);
  gradient.addColorStop(0.72, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.09)`);
  gradient.addColorStop(1, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0)`);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  return sprite;
}

export default function GlobalCursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    if (!canvas || !context || reduceMotion.matches || coarsePointer.matches) return;

    const sprites = trailColors.map(createGlowSprite);
    const particles: TrailParticle[] = [];
    const pointer = { active: false, x: 0, y: 0 };
    let animationFrame = 0;
    let pixelRatio = 1;

    const resize = () => {
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(window.innerWidth * pixelRatio));
      canvas.height = Math.max(1, Math.round(window.innerHeight * pixelRatio));
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const draw = () => {
      animationFrame = 0;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.age += 1;
        particle.life *= 0.928;
        particle.vx *= 0.94;
        particle.vy *= 0.94;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.spin;
        particle.stretch += (1.04 - particle.stretch) * 0.055;

        if (particle.life < 0.035) {
          particles.splice(index, 1);
          continue;
        }

        const radius = particle.radius * (1 + particle.age * 0.018);
        context.save();
        context.globalAlpha = Math.min(0.62, particle.life * 0.72);
        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);
        context.scale(particle.stretch, 1 / Math.sqrt(particle.stretch));
        context.drawImage(
          sprites[particle.colorIndex],
          -radius,
          -radius,
          radius * 2,
          radius * 2,
        );
        context.restore();
      }

      if (particles.length > 0) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    };

    const ensureAnimation = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(draw);
    };

    const spawnTrail = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;

      if (!pointer.active) {
        pointer.active = true;
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        return;
      }

      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 2) return;

      const count = Math.min(7, Math.max(2, Math.ceil(distance / 11)));
      const rotation = Math.atan2(dy, dx);

      for (let index = 0; index < count; index += 1) {
        const progress = (index + 1) / count;
        const drift = (Math.random() - 0.5) * 5;
        particles.push({
          age: 0,
          colorIndex: (particles.length + index) % trailColors.length,
          life: 1,
          radius: 24 + Math.min(22, distance * 0.24) + Math.random() * 7,
          rotation,
          spin: (Math.random() - 0.5) * 0.018,
          stretch: Math.min(2.8, 1.18 + distance / 35),
          vx: dx * 0.025 + drift * 0.04,
          vy: dy * 0.025 + drift * 0.04,
          x: pointer.x + dx * progress,
          y: pointer.y + dy * progress,
        });
      }

      if (particles.length > 54) {
        particles.splice(0, particles.length - 54);
      }

      pointer.x = event.clientX;
      pointer.y = event.clientY;
      ensureAnimation();
    };

    const resetPointer = () => {
      pointer.active = false;
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", spawnTrail, { passive: true });
    window.addEventListener("blur", resetPointer);
    document.documentElement.addEventListener("mouseleave", resetPointer);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", spawnTrail);
      window.removeEventListener("blur", resetPointer);
      document.documentElement.removeEventListener("mouseleave", resetPointer);
      particles.length = 0;
    };
  }, []);

  return <canvas className="global-cursor-trail" ref={canvasRef} aria-hidden="true" />;
}
