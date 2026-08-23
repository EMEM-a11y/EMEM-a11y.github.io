import { useEffect, useRef } from "react";

type Color = readonly [number, number, number];

type FluidBlob = {
  color: Color;
  opacity: number;
  orbitX: number;
  orbitY: number;
  phase: number;
  radius: number;
  speed: number;
  x: number;
  y: number;
};

type TrailParticle = {
  age: number;
  colorIndex: number;
  life: number;
  phase: number;
  radius: number;
  rotation: number;
  spin: number;
  stretch: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
};

const blobs: FluidBlob[] = [
  { x: 0.18, y: 0.24, radius: 0.54, orbitX: 0.12, orbitY: 0.1, speed: 0.16, phase: 0.3, color: [183, 167, 214], opacity: 0.34 },
  { x: 0.7, y: 0.2, radius: 0.48, orbitX: 0.14, orbitY: 0.08, speed: 0.13, phase: 2.1, color: [211, 196, 218], opacity: 0.38 },
  { x: 0.78, y: 0.76, radius: 0.58, orbitX: 0.1, orbitY: 0.12, speed: 0.11, phase: 4.4, color: [152, 113, 154], opacity: 0.24 },
  { x: 0.32, y: 0.8, radius: 0.5, orbitX: 0.08, orbitY: 0.14, speed: 0.14, phase: 5.7, color: [113, 83, 116], opacity: 0.16 },
];

const trailColors: Color[] = [
  [152, 113, 154],
  [183, 167, 214],
  [211, 196, 218],
];

function rgba(color: Color, opacity: number) {
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;
}

function paintBlob(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: Color,
  opacity: number,
  stretch: number,
  rotation: number,
) {
  context.save();
  context.translate(x, y);
  context.rotate(rotation);
  context.scale(stretch, 1 / stretch);

  const gradient = context.createRadialGradient(0, 0, 0, 0, 0, radius);
  gradient.addColorStop(0, rgba(color, opacity));
  gradient.addColorStop(0.42, rgba(color, opacity * 0.55));
  gradient.addColorStop(0.72, rgba(color, opacity * 0.18));
  gradient.addColorStop(1, rgba(color, 0));
  context.fillStyle = gradient;
  context.beginPath();
  context.arc(0, 0, radius, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function createGlowSprite(color: Color) {
  const sprite = document.createElement("canvas");
  sprite.width = 160;
  sprite.height = 160;
  const context = sprite.getContext("2d");
  if (!context) return sprite;

  const gradient = context.createRadialGradient(80, 80, 0, 80, 80, 80);
  gradient.addColorStop(0, rgba(color, 0.95));
  gradient.addColorStop(0.32, rgba(color, 0.62));
  gradient.addColorStop(0.68, rgba(color, 0.2));
  gradient.addColorStop(1, rgba(color, 0));
  context.fillStyle = gradient;
  context.fillRect(0, 0, 160, 160);
  return sprite;
}

export default function ContactFluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = canvas?.closest<HTMLElement>(".contact");
    const context = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !section || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const trailSprites = trailColors.map(createGlowSprite);
    const particles: TrailParticle[] = [];
    const pointer = {
      active: false,
      lastEventTime: 0,
      lastX: 0.62,
      lastY: 0.42,
      targetVx: 0,
      targetVy: 0,
      targetX: 0.62,
      targetY: 0.42,
      vx: 0,
      vy: 0,
      x: 0.62,
      y: 0.42,
    };
    let animationFrame = 0;
    let resizeFrame = 0;
    let lastFrame = 0;
    let isVisible = true;

    const resize = () => {
      const bounds = section.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = Math.max(1, Math.round(bounds.width * pixelRatio));
      canvas.height = Math.max(1, Math.round(bounds.height * pixelRatio));
      canvas.style.width = `${bounds.width}px`;
      canvas.style.height = `${bounds.height}px`;
    };

    const spawnTrail = (x: number, y: number, dx: number, dy: number, speed: number) => {
      const count = Math.min(7, Math.max(2, Math.ceil(speed / 22)));
      const angle = Math.atan2(dy * canvas.height, dx * canvas.width);
      const normalX = -Math.sin(angle);
      const normalY = Math.cos(angle);

      for (let index = 0; index < count; index += 1) {
        const progress = count === 1 ? 1 : index / (count - 1);
        const spread = (Math.random() - 0.5) * Math.min(0.035, speed / 9000);
        particles.push({
          x: pointer.lastX + dx * progress + normalX * spread,
          y: pointer.lastY + dy * progress + normalY * spread,
          vx: dx * (0.11 + Math.random() * 0.08) + normalX * spread * 0.12,
          vy: dy * (0.11 + Math.random() * 0.08) + normalY * spread * 0.12,
          radius: Math.min(0.12, 0.045 + speed / 2600) * (0.78 + Math.random() * 0.34),
          stretch: Math.min(3.4, 1.25 + speed / 75),
          rotation: angle,
          spin: (Math.random() - 0.5) * 0.025,
          phase: Math.random() * Math.PI * 2,
          age: 0,
          life: 1,
          colorIndex: (particles.length + index) % trailColors.length,
        });
      }

      if (particles.length > 72) {
        particles.splice(0, particles.length - 72);
      }
    };

    const paintTrail = (shortestSide: number) => {
      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.age += 1;
        particle.life *= 0.953;
        particle.rotation += particle.spin;

        const curl = Math.sin(particle.phase + particle.age * 0.075) * 0.00011;
        const cosine = Math.cos(curl);
        const sine = Math.sin(curl);
        const nextVx = particle.vx * cosine - particle.vy * sine;
        const nextVy = particle.vx * sine + particle.vy * cosine;
        particle.vx = nextVx * 0.94;
        particle.vy = nextVy * 0.94 - 0.000035;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.stretch += (1.08 - particle.stretch) * 0.035;

        if (particle.life < 0.055) {
          particles.splice(index, 1);
          continue;
        }

        const radius = shortestSide * particle.radius * (0.78 + (1 - particle.life) * 0.55);
        context.save();
        context.globalAlpha = Math.min(0.72, particle.life * 0.86);
        context.translate(particle.x * canvas.width, particle.y * canvas.height);
        context.rotate(particle.rotation);
        context.scale(particle.stretch, 1 / Math.sqrt(particle.stretch));
        context.drawImage(
          trailSprites[particle.colorIndex],
          -radius,
          -radius,
          radius * 2,
          radius * 2,
        );
        context.restore();
      }
    };

    const draw = (time: number) => {
      const width = canvas.width;
      const height = canvas.height;
      const shortestSide = Math.min(width, height);
      const elapsed = time * 0.001;

      pointer.x += (pointer.targetX - pointer.x) * 0.2;
      pointer.y += (pointer.targetY - pointer.y) * 0.2;
      pointer.vx += (pointer.targetVx - pointer.vx) * 0.18;
      pointer.vy += (pointer.targetVy - pointer.vy) * 0.18;
      pointer.targetVx *= 0.84;
      pointer.targetVy *= 0.84;

      context.globalCompositeOperation = "source-over";
      context.fillStyle = "#f4eff7";
      context.fillRect(0, 0, width, height);
      context.globalCompositeOperation = "source-over";

      blobs.forEach((blob, index) => {
        const wave = elapsed * blob.speed + blob.phase;
        const pointerPull = pointer.active ? 0.04 + index * 0.01 : 0;
        const x = (
          blob.x
          + Math.sin(wave * 1.17) * blob.orbitX
          + (pointer.x - 0.5) * pointerPull
        ) * width;
        const y = (
          blob.y
          + Math.cos(wave * 0.91) * blob.orbitY
          + (pointer.y - 0.5) * pointerPull
        ) * height;

        paintBlob(
          context,
          x,
          y,
          shortestSide * blob.radius,
          blob.color,
          blob.opacity,
          1.12 + Math.sin(wave) * 0.14,
          Math.sin(wave * 0.7) * 0.42,
        );
      });

      paintTrail(shortestSide);

      if (pointer.active) {
        const velocity = Math.hypot(pointer.vx * width, pointer.vy * height);
        paintBlob(
          context,
          pointer.x * width,
          pointer.y * height,
          shortestSide * Math.min(0.27, 0.18 + velocity / 3200),
          [152, 113, 154],
          0.26,
          Math.min(2.75, 1.18 + velocity / 145),
          Math.atan2(pointer.vy * height, pointer.vx * width),
        );
      }

      context.globalCompositeOperation = "source-over";
      const vignette = context.createRadialGradient(
        width * 0.54,
        height * 0.45,
        shortestSide * 0.08,
        width * 0.54,
        height * 0.45,
        Math.max(width, height) * 0.76,
      );
      vignette.addColorStop(0, "rgba(73, 49, 79, 0)");
      vignette.addColorStop(1, "rgba(73, 49, 79, 0.08)");
      context.fillStyle = vignette;
      context.fillRect(0, 0, width, height);
    };

    const animate = (time: number) => {
      animationFrame = window.requestAnimationFrame(animate);
      if (!isVisible || time - lastFrame < 1000 / 30) return;
      lastFrame = time;
      draw(time);
    };

    const updatePointer = (event: MouseEvent) => {
      if (reducedMotion) return;
      const bounds = section.getBoundingClientRect();
      if (
        event.clientX < bounds.left
        || event.clientX > bounds.right
        || event.clientY < bounds.top
        || event.clientY > bounds.bottom
      ) {
        pointer.targetX = 0.62;
        pointer.targetY = 0.42;
        pointer.active = false;
        return;
      }
      const x = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
      const y = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));
      const dx = pointer.active ? x - pointer.lastX : 0;
      const dy = pointer.active ? y - pointer.lastY : 0;
      const elapsed = Math.max(8, event.timeStamp - pointer.lastEventTime);
      const distance = Math.hypot(dx * canvas.width, dy * canvas.height);
      const speed = distance * (16 / elapsed);
      const motion = Math.max(speed, distance * 0.65);

      if (pointer.active && distance > 1.2) {
        spawnTrail(x, y, dx, dy, motion);
      }

      pointer.active = true;
      pointer.targetX = x;
      pointer.targetY = y;
      pointer.targetVx = dx * (16 / elapsed);
      pointer.targetVy = dy * (16 / elapsed);
      pointer.lastX = x;
      pointer.lastY = y;
      pointer.lastEventTime = event.timeStamp;
    };

    const resetPointer = () => {
      pointer.targetX = 0.62;
      pointer.targetY = 0.42;
      pointer.targetVx = 0;
      pointer.targetVy = 0;
      pointer.active = false;
    };

    const resizeObserver = new ResizeObserver(() => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        resize();
        draw(performance.now());
      });
    });
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });

    resizeObserver.observe(section);
    visibilityObserver.observe(section);
    window.addEventListener("mousemove", updatePointer, { passive: true });
    section.addEventListener("pointerleave", resetPointer);
    resize();
    draw(0);

    if (!reducedMotion) {
      animationFrame = window.requestAnimationFrame(animate);
    }

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.cancelAnimationFrame(resizeFrame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener("mousemove", updatePointer);
      section.removeEventListener("pointerleave", resetPointer);
      particles.length = 0;
    };
  }, []);

  return <canvas className="contact-fluid-canvas" ref={canvasRef} aria-hidden="true" />;
}
