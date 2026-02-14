import { useEffect, useRef } from "react";
import type { HeaderLocale } from "../types";
import { IconBroadcast, IconMoon, IconSun } from "./icons";

type HeaderTopBarProps = {
  liveLabel: string;
  marqueeLabel: string;
  locale: HeaderLocale;
  isDark: boolean;
  onToggleTheme: () => void;
  onLocaleChange: (next: HeaderLocale) => void;
};

export const HeaderTopBar = ({
  liveLabel,
  marqueeLabel,
  locale,
  isDark,
  onToggleTheme,
  onLocaleChange,
}: HeaderTopBarProps) => {
  const marqueeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = marqueeRef.current;
    if (!node) return;

    const setRunway = () => {
      node.style.setProperty("--hdr-marquee-runway", `${node.clientWidth}px`);
    };

    setRunway();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => setRunway());
      observer.observe(node);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", setRunway);
    return () => window.removeEventListener("resize", setRunway);
  }, []);

  return (
    <div className="hdr-livebar">
      <span className="hdr-live-pill">
        <IconBroadcast />
        {liveLabel}
      </span>
      <div ref={marqueeRef} className="hdr-marquee">
        <div className="hdr-marquee-track">
          <span>{marqueeLabel}</span>
          <span aria-hidden="true">{marqueeLabel}</span>
        </div>
      </div>
      <div className="hdr-top-actions" role="group" aria-label="Top utilities">
        <button
          type="button"
          className="hdr-icon-btn"
          onClick={onToggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Light mode" : "Dark mode"}
        >
          {isDark ? <IconSun /> : <IconMoon />}
        </button>

        <div className="hdr-locale-switch" role="group" aria-label="Language">
          <button
            type="button"
            className={locale === "en" ? "is-active" : ""}
            onClick={() => onLocaleChange("en")}
          >
            EN
          </button>
          <button
            type="button"
            className={locale === "vi" ? "is-active" : ""}
            onClick={() => onLocaleChange("vi")}
          >
            VI
          </button>
        </div>
      </div>
    </div>
  );
};
