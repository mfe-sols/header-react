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
  const marqueeTrackRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const marquee = marqueeRef.current;
    const track = marqueeTrackRef.current;
    if (!track || !marquee) return;

    const setPaused = (paused: boolean) => {
      track.setAttribute("data-paused", paused ? "true" : "false");
    };

    const onVisibilityChange = () => {
      setPaused(document.hidden);
    };
    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);

    if (typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setPaused(!entry.isIntersecting || document.hidden);
        },
        { threshold: 0.01 }
      );
      observer.observe(marquee);
      return () => {
        document.removeEventListener("visibilitychange", onVisibilityChange);
        observer.disconnect();
      };
    }

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <div className="hdr-livebar">
      <span className="hdr-live-pill">
        <IconBroadcast />
        {liveLabel}
      </span>
      <div ref={marqueeRef} className="hdr-marquee">
        <div ref={marqueeTrackRef} className="hdr-marquee-track" data-paused="false">
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
