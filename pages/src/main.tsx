import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import AviaryJournal from "../../app/AviaryJournal";
import "./pages.css";
import "./icon-fixes.css";

function PagesApp() {
  useEffect(() => {
    const map = document.querySelector<HTMLElement>(".encounterMap");
    const shell = map?.closest<HTMLElement>(".mapShell");
    const image = map?.querySelector<HTMLElement>(".worldMap");
    if (!map || !shell || !image) return;

    const correctedAnchors: Record<string, { left: number; top: number }> = {
      clay: { left: 0.16, top: 0.29 },
      sage: { left: 0.262, top: 0.24 },
      blue: { left: 0.302, top: 0.295 },
      moss: { left: 0.772, top: 0.357 },
      gold: { left: 0.805, top: 0.405 },
      rose: { left: 0.835, top: 0.435 },
    };

    const pins = Array.from(map.querySelectorAll<HTMLElement>(".mapPin"));
    const pinAnchors = pins.map((pin) => {
      const tone = ["clay", "sage", "blue", "moss", "gold", "rose"].find((name) => pin.classList.contains(name));
      const corrected = tone ? correctedAnchors[tone] : undefined;
      const left = corrected?.left ?? Number.parseFloat(pin.style.left) / 100;
      const top = corrected?.top ?? Number.parseFloat(pin.style.top) / 100;
      const originalLeft = `${left * 100}%`;
      const originalTop = `${top * 100}%`;
      pin.style.left = originalLeft;
      pin.style.top = originalTop;
      return { pin, left, top, originalLeft, originalTop };
    });

    let scale = 1;
    let x = 0;
    let y = 0;
    let lastDistance: number | null = null;
    const pointers = new Map<number, { x: number; y: number }>();

    const clampPan = () => {
      const rect = map.getBoundingClientRect();
      const maxX = Math.max(0, ((scale - 1) * rect.width) / 2);
      const maxY = Math.max(0, ((scale - 1) * rect.height) / 2);
      x = Math.max(-maxX, Math.min(maxX, x));
      y = Math.max(-maxY, Math.min(maxY, y));
    };

    const apply = () => {
      clampPan();
      const rect = map.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      image.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;

      for (const anchor of pinAnchors) {
        const originalX = anchor.left * rect.width;
        const originalY = anchor.top * rect.height;
        const nextX = cx + (originalX - cx) * scale + x;
        const nextY = cy + (originalY - cy) * scale + y;
        anchor.pin.style.left = `${nextX}px`;
        anchor.pin.style.top = `${nextY}px`;
      }

      shell.classList.toggle("is-zoomed", scale > 1.01);
      zoomOutButton.disabled = scale <= 1.01;
      zoomInButton.disabled = scale >= 3.99;
      resetButton.disabled = scale <= 1.01;
    };

    const reset = () => {
      scale = 1;
      x = 0;
      y = 0;
      lastDistance = null;
      image.style.transform = "";
      for (const anchor of pinAnchors) {
        anchor.pin.style.left = anchor.originalLeft;
        anchor.pin.style.top = anchor.originalTop;
      }
      shell.classList.remove("is-zoomed");
      zoomOutButton.disabled = true;
      zoomInButton.disabled = false;
      resetButton.disabled = true;
    };

    const controls = document.createElement("div");
    controls.className = "mapZoomControls";
    controls.setAttribute("aria-label", "Map zoom controls");

    const zoomOutButton = document.createElement("button");
    zoomOutButton.type = "button";
    zoomOutButton.className = "mapZoomButton";
    zoomOutButton.textContent = "−";
    zoomOutButton.setAttribute("aria-label", "Zoom out");
    zoomOutButton.disabled = true;

    const zoomInButton = document.createElement("button");
    zoomInButton.type = "button";
    zoomInButton.className = "mapZoomButton";
    zoomInButton.textContent = "+";
    zoomInButton.setAttribute("aria-label", "Zoom in");

    const resetButton = document.createElement("button");
    resetButton.type = "button";
    resetButton.className = "mapZoomReset";
    resetButton.textContent = "Reset map";
    resetButton.setAttribute("aria-label", "Reset map zoom and position");
    resetButton.disabled = true;

    zoomOutButton.addEventListener("click", () => {
      scale = Math.max(1, scale / 1.5);
      if (scale <= 1.01) {
        reset();
        return;
      }
      apply();
    });
    zoomInButton.addEventListener("click", () => {
      scale = Math.min(4, scale * 1.5);
      apply();
    });
    resetButton.addEventListener("click", reset);
    controls.append(zoomOutButton, zoomInButton, resetButton);
    shell.appendChild(controls);

    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const nextScale = Math.max(1, Math.min(4, scale * (event.deltaY < 0 ? 1.14 : 0.88)));
      if (nextScale === scale) return;
      scale = nextScale;
      if (scale === 1) {
        x = 0;
        y = 0;
      }
      apply();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || (event.target as Element).closest("button")) return;
      map.setPointerCapture?.(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        lastDistance = Math.hypot(b.x - a.x, b.y - a.y);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const previous = pointers.get(event.pointerId);
      if (!previous) return;

      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointers.size === 1 && scale > 1) {
        x += event.clientX - previous.x;
        y += event.clientY - previous.y;
        apply();
        return;
      }

      if (pointers.size >= 2) {
        const [a, b] = [...pointers.values()];
        const distance = Math.hypot(b.x - a.x, b.y - a.y);
        if (lastDistance && lastDistance > 0) {
          scale = Math.max(1, Math.min(4, scale * (distance / lastDistance)));
          if (scale === 1) {
            x = 0;
            y = 0;
          }
          apply();
        }
        lastDistance = distance;
      }
    };

    const onPointerEnd = (event: PointerEvent) => {
      pointers.delete(event.pointerId);
      if (pointers.size < 2) lastDistance = null;
    };

    const onResize = () => {
      if (scale > 1.01) apply();
    };

    map.addEventListener("wheel", onWheel, { passive: false });
    map.addEventListener("pointerdown", onPointerDown);
    map.addEventListener("pointermove", onPointerMove);
    map.addEventListener("pointerup", onPointerEnd);
    map.addEventListener("pointercancel", onPointerEnd);
    window.addEventListener("resize", onResize);

    return () => {
      map.removeEventListener("wheel", onWheel);
      map.removeEventListener("pointerdown", onPointerDown);
      map.removeEventListener("pointermove", onPointerMove);
      map.removeEventListener("pointerup", onPointerEnd);
      map.removeEventListener("pointercancel", onPointerEnd);
      window.removeEventListener("resize", onResize);
      resetButton.removeEventListener("click", reset);
      controls.remove();
      image.style.transform = "";
      for (const anchor of pinAnchors) {
        anchor.pin.style.left = anchor.originalLeft;
        anchor.pin.style.top = anchor.originalTop;
      }
      shell.classList.remove("is-zoomed");
    };
  }, []);

  return <AviaryJournal />;
}

if (typeof document !== "undefined") {
  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <PagesApp />
    </React.StrictMode>,
  );
}
