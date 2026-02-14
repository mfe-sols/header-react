import { useEffect } from "react";

export const useClickOutside = <T extends HTMLElement>(
  ref: { current: T | null },
  onOutside: () => void,
  enabled = true
) => {
  useEffect(() => {
    if (!enabled) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (!ref.current?.contains(target)) {
        onOutside();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [enabled, onOutside, ref]);
};
