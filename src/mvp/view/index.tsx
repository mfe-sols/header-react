import {
  type CSSProperties,
  useEffect,
  useMemo,
  useState,
} from "react";
import "./header.css";
import {
  resolveHeaderConfig,
  type HeaderMenuGroupInput,
} from "./header.config";
import { getInitials } from "./helpers";
import { useEscapeKey } from "./hooks/useEscapeKey";
import type { AuthUserInfo, HeaderLocale } from "./types";
import {
  DesktopNav,
  HeaderActions,
  HeaderTopBar,
  IconSearch,
  MobileDrawer,
} from "./components";

type Props = {
  title: string;
  headings: string[];
  locale: HeaderLocale;
  themeMode: "light" | "dark";
  onToggleTheme: () => void;
  onLocaleChange: (next: HeaderLocale) => void;
  authUser?: AuthUserInfo | null;
  onSignOut?: () => void;
  menuOverride?: HeaderMenuGroupInput[] | null;
};

export const AppView = ({
  title,
  headings,
  locale,
  themeMode,
  onToggleTheme,
  onLocaleChange,
  authUser,
  onSignOut,
  menuOverride,
}: Props): React.JSX.Element => {
  const isDark = themeMode === "dark";
  const config = useMemo(
    () => resolveHeaderConfig(title, headings, menuOverride),
    [headings, menuOverride, title]
  );
  const localized = locale === "vi" ? config.locale.vi : config.locale.en;
  const megaMenu = config.menu;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMobileGroup, setActiveMobileGroup] = useState<string>(megaMenu[0]?.id || "");
  const searchPlaceholder = "Search...";

  const marqueeLabel = useMemo(() => {
    const items = headings.filter(Boolean).slice(0, config.marqueeMaxItems);
    if (items.length) return items.join("  ·  ");
    return config.marqueeFallback;
  }, [config.marqueeFallback, config.marqueeMaxItems, headings]);

  useEffect(() => {
    if (!megaMenu.find((group) => group.id === activeMobileGroup)) {
      setActiveMobileGroup(megaMenu[0]?.id || "");
    }
  }, [megaMenu, activeMobileGroup]);

  useEscapeKey(() => setMobileMenuOpen(false), mobileMenuOpen);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1100px)");
    const closeOnDesktop = (event: MediaQueryListEvent | MediaQueryList) => {
      if (event.matches) setMobileMenuOpen(false);
    };
    closeOnDesktop(desktop);

    if (typeof desktop.addEventListener === "function") {
      desktop.addEventListener("change", closeOnDesktop);
      return () => desktop.removeEventListener("change", closeOnDesktop);
    }

    desktop.addListener(closeOnDesktop);
    return () => desktop.removeListener(closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.removeProperty("overflow");
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [mobileMenuOpen]);

  const rootStyle = {
    "--hdr-surface": isDark ? "#0f172a" : "#ffffff",
    "--hdr-surface-muted": isDark ? "#1e293b" : "#f8fafc",
    "--hdr-surface-raised": isDark ? "#111d32" : "#ffffff",
    "--hdr-border": isDark ? "#25324a" : "#e2e8f0",
    "--hdr-text": isDark ? "#f8fafc" : "#0f172a",
    "--hdr-text-muted": isDark ? "#9fb0c9" : "#667085",
    "--hdr-text-subtle": isDark ? "#6b7f9c" : "#98a2b3",
    "--hdr-brand-a": isDark ? "#34d399" : config.palette.brandA,
    "--hdr-brand-b": isDark ? "#22d3ee" : config.palette.brandB,
    "--hdr-brand-text": isDark ? "#05212d" : "#ffffff",
    "--hdr-live-bg": isDark ? "rgba(52,211,153,.12)" : "#ecfdf5",
    "--hdr-live-fg": isDark ? "#6ee7b7" : "#065f46",
    "--hdr-live-border": isDark ? "rgba(52,211,153,.3)" : "#a7f3d0",
    "--hdr-accent": config.palette.accent,
    "--hdr-desktop-max": config.layout.desktopMaxWidth,
    "--hdr-shadow": isDark ? "0 22px 52px rgba(2,6,23,.55)" : "0 20px 48px rgba(15,23,42,.14)",
  } as CSSProperties;

  return (
    <header className="hdr-shell" style={rootStyle}>
      <HeaderTopBar
        liveLabel={localized.live}
        marqueeLabel={marqueeLabel}
        locale={locale}
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        onLocaleChange={onLocaleChange}
      />

      <div className="hdr-main-row">
        <div className="hdr-brand">
          <div className="hdr-brand-logo" aria-hidden="true">
            <span className="hdr-brand-logo-core">{getInitials(title)}</span>
            <span className="hdr-brand-logo-ring" />
            <span className="hdr-brand-logo-glint" />
            <span className="hdr-brand-logo-speed hdr-brand-logo-speed-a" />
            <span className="hdr-brand-logo-speed hdr-brand-logo-speed-b" />
          </div>
        </div>

        <DesktopNav locale={locale} menu={megaMenu} />

        <label className="hdr-search hdr-main-search">
          <span className="icon"><IconSearch /></span>
          <input type="search" placeholder={searchPlaceholder} aria-label={searchPlaceholder} />
          <kbd>⌘K</kbd>
        </label>

        <HeaderActions
          locale={locale}
          searchPlaceholder={searchPlaceholder}
          isDark={isDark}
          onToggleTheme={onToggleTheme}
          onLocaleChange={onLocaleChange}
          authUser={authUser}
          onSignOut={onSignOut}
          userMenuText={{
            profile: localized.profile,
            signOut: localized.signOut,
            openUserMenu: localized.openUserMenu,
          }}
          mobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
          closeNavigationLabel={localized.closeNavigation}
          openNavigationLabel={localized.openNavigation}
        />
      </div>

      <div className="hdr-tablet-quick-nav" aria-label="Quick navigation">
        {megaMenu.map((menu) => (
          <button
            key={`quick-${menu.id}`}
            type="button"
            className={menu.id === activeMobileGroup ? "is-active" : ""}
            onClick={() => {
              setActiveMobileGroup(menu.id);
              setMobileMenuOpen(true);
            }}
          >
            {menu.label}
          </button>
        ))}
      </div>

      <MobileDrawer
        open={mobileMenuOpen}
        title={localized.navigation}
        closeLabel={localized.closeNavigation}
        searchPlaceholder={searchPlaceholder}
        activeGroupId={activeMobileGroup}
        menu={megaMenu}
        onClose={() => setMobileMenuOpen(false)}
        onSelectGroup={setActiveMobileGroup}
      />
    </header>
  );
};
