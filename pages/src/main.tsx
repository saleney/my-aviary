import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import AviaryJournal from "../../app/AviaryJournal";
import "./pages.css";
import "./icon-fixes.css";

function PagesApp() {
  useEffect(() => {
    const map = document.querySelector<HTMLElement>(".encounterMap");
    const shell = map?.closest<HTMLElement>(".mapShell");
    if (!map || !shell) return;

    let scale = 1;
    let x = 0;
    let y = 0;
    let lastDistance: number | null = null;
    const pointers = new Map<number, { x: number; y: number }>();

    const clampPan = () => {
      const rect = shell.getBoundingClientRect();
      const maxX = Math.max(0, ((scale - 1) * rect.width) / 2);
      const maxY = Math.max(0, ((scale - 1) * rect.height) / 2);
      x = Math.max(-maxX, Math.min(maxX, x));
      y = Math.max(-maxY, Math.min(maxY, y));
    };

    const apply = () => {
      clampPan();
      map.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      shell.classList.toggle("is-zoomed", scale > 1.01);
    };

    const reset = () => {
      scale = 1;
      x = 0;
      y = 0;
      lastDistance = null;
      apply();
    };

    const resetButton = document.createElement("button");
    resetButton.type = "button";
    resetButton.className = "mapZoomReset";
    resetButton.textContent = "Reset map";
    resetButton.setAttribute("aria-label", "Reset map zoom and position");
    resetButton.addEventListener("click", reset);
    shell.appendChild(resetButton);

    const onWheel = (event: WheelEvent) => {
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

    map.addEventListener("wheel", onWheel, { passive: false });
    map.addEventListener("pointerdown", onPointerDown);
    map.addEventListener("pointermove", onPointerMove);
    map.addEventListener("pointerup", onPointerEnd);
    map.addEventListener("pointercancel", onPointerEnd);

    return () => {
      map.removeEventListener("wheel", onWheel);
      map.removeEventListener("pointerdown", onPointerDown);
      map.removeEventListener("pointermove", onPointerMove);
      map.removeEventListener("pointerup", onPointerEnd);
      map.removeEventListener("pointercancel", onPointerEnd);
      resetButton.removeEventListener("click", reset);
      resetButton.remove();
      map.style.transform = "";
      shell.classList.remove("is-zoomed");
    };
  }, []);

  return <AviaryJournal />;
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PagesApp />
  </React.StrictMode>,
);
