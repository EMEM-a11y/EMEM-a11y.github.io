import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type MouseControls = {
  enabled?: boolean;
  radius?: number;
  strength?: number;
};

type ParticleTextProps = {
  text: string;
  colors?: string[];
  particleSize?: number;
  particleGap?: number;
  fontSize?: number;
  friction?: number;
  ease?: number;
  mouseControls?: MouseControls;
  className?: string;
};

const DEFAULT_COLORS = ["#62556c", "#98719a", "#ad89a7"];

export default function ParticleText({
  text,
  colors = DEFAULT_COLORS,
  particleSize = 2.15,
  particleGap = 4,
  fontSize = 220,
  friction = 0.82,
  ease = 0.065,
  mouseControls = { enabled: true, radius: 120, strength: 4.5 },
  className = "",
}: ParticleTextProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const colorKey = colors.join("|");
  const mouseEnabled = mouseControls.enabled ?? true;
  const mouseRadius = mouseControls.radius ?? 120;
  const mouseStrength = mouseControls.strength ?? 4.5;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 5000);
    const palette = colorKey.split("|").map((color) => new THREE.Color(color));
    const pointer = { x: 0, y: 0, active: false };
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let points: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial> | null = null;
    let homes = new Float32Array();
    let velocities = new Float32Array();
    let animationFrame = 0;
    let resizeFrame = 0;
    let isVisible = true;
    let disposed = false;

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    const disposePoints = () => {
      if (!points) return;
      scene.remove(points);
      points.geometry.dispose();
      points.material.map?.dispose();
      points.material.dispose();
      points = null;
    };

    const createParticleTexture = () => {
      const textureCanvas = document.createElement("canvas");
      textureCanvas.width = 32;
      textureCanvas.height = 32;
      const textureContext = textureCanvas.getContext("2d");
      if (!textureContext) return null;
      textureContext.fillStyle = "#ffffff";
      textureContext.beginPath();
      textureContext.arc(16, 16, 14, 0, Math.PI * 2);
      textureContext.fill();
      const texture = new THREE.CanvasTexture(textureCanvas);
      texture.needsUpdate = true;
      return texture;
    };

    const fitFontSize = (context: CanvasRenderingContext2D, width: number, height: number) => {
      let low = 12;
      let high = fontSize;
      for (let index = 0; index < 12; index += 1) {
        const candidate = (low + high) / 2;
        context.font = `900 ${candidate}px Kanit, sans-serif`;
        const metrics = context.measureText(text);
        if (metrics.width <= width * 0.97 && candidate <= height * 0.82) low = candidate;
        else high = candidate;
      }
      return low;
    };

    const buildParticles = () => {
      const width = Math.round(mount.clientWidth);
      const height = Math.round(mount.clientHeight);
      if (width < 2 || height < 2 || disposed) return;

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.set(0, 0, height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))));
      camera.updateProjectionMatrix();

      const drawingCanvas = document.createElement("canvas");
      drawingCanvas.width = width;
      drawingCanvas.height = height;
      const context = drawingCanvas.getContext("2d", { willReadFrequently: true });
      if (!context) return;

      const fittedFontSize = fitFontSize(context, width, height);
      context.fillStyle = "#ffffff";
      context.font = `900 ${fittedFontSize}px Kanit, sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "alphabetic";
      const metrics = context.measureText(text);
      const baseline = height / 2 + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
      context.fillText(text, width / 2, baseline);

      const pixels = context.getImageData(0, 0, width, height).data;
      const positions: number[] = [];
      const particleColors: number[] = [];
      const gap = Math.max(2, Math.round(particleGap));

      for (let y = 0, row = 0; y < height; y += gap, row += 1) {
        const rowOffset = row % 2 === 0 ? 0 : Math.floor(gap / 2);
        for (let x = rowOffset; x < width; x += gap) {
          if (pixels[(y * width + x) * 4 + 3] < 128) continue;
          positions.push(x - width / 2, height / 2 - y, 0);

          const colorPosition = (x / Math.max(width - 1, 1)) * Math.max(palette.length - 1, 0);
          const colorIndex = Math.min(Math.floor(colorPosition), Math.max(palette.length - 1, 0));
          const nextColorIndex = Math.min(colorIndex + 1, Math.max(palette.length - 1, 0));
          const color = palette[colorIndex].clone().lerp(palette[nextColorIndex], colorPosition - colorIndex);
          particleColors.push(color.r, color.g, color.b);
        }
      }

      disposePoints();
      homes = new Float32Array(positions);
      velocities = new Float32Array(positions.length);

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.Float32BufferAttribute(particleColors, 3));
      const material = new THREE.PointsMaterial({
        size: particleSize,
        sizeAttenuation: true,
        transparent: true,
        opacity: 1,
        map: createParticleTexture(),
        alphaTest: 0.12,
        depthWrite: false,
        toneMapped: false,
        vertexColors: true,
      });
      points = new THREE.Points(geometry, material);
      scene.add(points);
      renderer.render(scene, camera);
      setIsReady(true);
    };

    const updatePointer = (event: PointerEvent) => {
      if (reduceMotion || !mouseEnabled || event.pointerType === "touch") return;
      const bounds = mount.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left - bounds.width / 2;
      pointer.y = bounds.height / 2 - (event.clientY - bounds.top);
      pointer.active = true;
    };

    const deactivatePointer = () => {
      pointer.active = false;
    };

    const animate = () => {
      animationFrame = window.requestAnimationFrame(animate);
      if (!points || !isVisible || reduceMotion) return;

      const positionAttribute = points.geometry.getAttribute("position") as THREE.BufferAttribute;
      const positions = positionAttribute.array as Float32Array;

      for (let index = 0; index < positions.length; index += 3) {
        if (pointer.active) {
          const deltaX = positions[index] - pointer.x;
          const deltaY = positions[index + 1] - pointer.y;
          const distance = Math.hypot(deltaX, deltaY);
          if (distance > 0 && distance < mouseRadius) {
            const force = (1 - distance / mouseRadius) * mouseStrength;
            velocities[index] += (deltaX / distance) * force;
            velocities[index + 1] += (deltaY / distance) * force;
            velocities[index + 2] += force * 0.65;
          }
        }

        velocities[index] *= friction;
        velocities[index + 1] *= friction;
        velocities[index + 2] *= friction;
        positions[index] += velocities[index] + (homes[index] - positions[index]) * ease;
        positions[index + 1] += velocities[index + 1] + (homes[index + 1] - positions[index + 1]) * ease;
        positions[index + 2] += velocities[index + 2] + (homes[index + 2] - positions[index + 2]) * ease;
      }

      positionAttribute.needsUpdate = true;
      renderer.render(scene, camera);
    };

    const resizeObserver = new ResizeObserver(() => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(buildParticles);
    });
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });

    resizeObserver.observe(mount);
    visibilityObserver.observe(mount);
    mount.addEventListener("pointermove", updatePointer);
    mount.addEventListener("pointerleave", deactivatePointer);

    void document.fonts.ready.then(buildParticles);
    animate();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.cancelAnimationFrame(resizeFrame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      mount.removeEventListener("pointermove", updatePointer);
      mount.removeEventListener("pointerleave", deactivatePointer);
      disposePoints();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [colorKey, ease, fontSize, friction, mouseEnabled, mouseRadius, mouseStrength, particleGap, particleSize, text]);

  return (
    <div className={`particle-text ${isReady ? "is-ready" : ""} ${className}`.trim()}>
      <span className="particle-text-fallback" aria-hidden="true">{text}</span>
      <div className="particle-text-canvas" ref={mountRef} aria-hidden="true" />
    </div>
  );
}
