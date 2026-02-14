import {
  useCallback,
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./header.css";
import {
  resolveHeaderConfig,
  type HeaderMenuGroupInput,
} from "./header.config";
import { getInitials } from "./helpers";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
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
  onSearchQueryChange?: (query: string) => void;
};

const resolveSearchShortcut = () => {
  if (typeof navigator === "undefined") return "⌘K";
  const platform = `${navigator.platform || ""} ${navigator.userAgent || ""}`.toLowerCase();
  return /(mac|iphone|ipad|ipod)/.test(platform) ? "⌘K" : "Ctrl K";
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
  onSearchQueryChange,
}: Props): React.JSX.Element => {
  const headerRef = useRef<HTMLElement | null>(null);
  const mainSearchInputRef = useRef<HTMLInputElement | null>(null);
  const actionsSearchInputRef = useRef<HTMLInputElement | null>(null);
  const drawerSearchInputRef = useRef<HTMLInputElement | null>(null);
  const isDark = themeMode === "dark";
  const config = useMemo(
    () => resolveHeaderConfig(title, headings, menuOverride),
    [headings, menuOverride, title]
  );
  const localized = locale === "vi" ? config.locale.vi : config.locale.en;
  const megaMenu = config.menu;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMobileGroup, setActiveMobileGroup] = useState<string>(megaMenu[0]?.id || "");
  const [searchValue, setSearchValue] = useState("");
  const searchPlaceholder = "Search...";
  const searchShortcut = useMemo(() => resolveSearchShortcut(), []);
  const debouncedSearchValue = useDebouncedValue(searchValue, 280);

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
    onSearchQueryChange?.(debouncedSearchValue.trim());
  }, [debouncedSearchValue, onSearchQueryChange]);

  const handleSearchValueChange = useCallback((next: string) => {
    setSearchValue(next);
  }, []);

  const focusSearchInput = useCallback(() => {
    const isVisible = (input: HTMLInputElement | null) =>
      Boolean(input && (input.offsetParent !== null || input.getClientRects().length > 0));

    const candidates = [
      mobileMenuOpen ? drawerSearchInputRef.current : null,
      actionsSearchInputRef.current,
      mainSearchInputRef.current,
      headerRef.current?.querySelector('input[type="search"]') as HTMLInputElement | null,
    ];

    const target = candidates.find((input) => isVisible(input)) || null;
    if (!target) return;

    target.focus();
    if (typeof target.select === "function") {
      target.select();
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key.toLowerCase() !== "k") return;

      const target = event.target as HTMLElement | null;
      const isEditable =
        Boolean(target?.isContentEditable) ||
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT";
      if (isEditable) return;

      event.preventDefault();
      focusSearchInput();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [focusSearchInput]);

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
    if (!mobileMenuOpen || typeof document === "undefined") return;

    const body = document.body;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const lockKey = "data-hdr-lock-scroll-y";

    body.setAttribute(lockKey, String(scrollY));
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    return () => {
      const lockedY = Number(body.getAttribute(lockKey) || "0");
      body.removeAttribute(lockKey);
      body.style.removeProperty("position");
      body.style.removeProperty("top");
      body.style.removeProperty("left");
      body.style.removeProperty("right");
      body.style.removeProperty("width");
      body.style.removeProperty("overflow");
      window.scrollTo(0, Number.isFinite(lockedY) ? lockedY : 0);
    };
  }, [mobileMenuOpen]);

  const rootStyle = {
    "--hdr-surface": isDark ? "#0b1220" : "#ffffff",
    "--hdr-surface-muted": isDark ? "#111827" : "#f8fafc",
    "--hdr-surface-raised": isDark ? "#0f172a" : "#ffffff",
    "--hdr-border": isDark ? "#273449" : "#dfe5ef",
    "--hdr-text": isDark ? "#e2e8f0" : "#0f172a",
    "--hdr-text-muted": isDark ? "#9fb0c9" : "#5b6472",
    "--hdr-text-subtle": isDark ? "#8190a8" : "#94a3b8",
    "--hdr-brand-a": isDark ? "#34d399" : config.palette.brandA,
    "--hdr-brand-b": isDark ? "#22d3ee" : config.palette.brandB,
    "--hdr-brand-text": isDark ? "#05212d" : "#ffffff",
    "--hdr-live-bg": "rgba(15,118,110,.08)",
    "--hdr-live-fg": "#0f766e",
    "--hdr-live-border": "rgba(15,118,110,.25)",
    "--hdr-accent": "#0f766e",
    "--hdr-accent-strong": "#115e59",
    "--hdr-control-border": isDark ? "rgba(100,116,139,.52)" : "rgba(148,163,184,.5)",
    "--hdr-control-surface": isDark ? "rgba(15,23,42,.82)" : "rgba(248,250,252,.9)",
    "--hdr-desktop-max": config.layout.desktopMaxWidth,
    "--hdr-shadow": isDark ? "0 22px 52px rgba(2,6,23,.55)" : "0 20px 48px rgba(15,23,42,.14)",
  } as CSSProperties;

  return (
    <header ref={headerRef} className="hdr-shell" style={rootStyle}>
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
          <input
            ref={mainSearchInputRef}
            type="search"
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            value={searchValue}
            onChange={(event) =>
              handleSearchValueChange((event.target as HTMLInputElement).value)
            }
          />
          <kbd>{searchShortcut}</kbd>
        </label>

        <HeaderActions
          locale={locale}
          searchPlaceholder={searchPlaceholder}
          searchShortcut={searchShortcut}
          searchValue={searchValue}
          onSearchValueChange={handleSearchValueChange}
          searchInputRef={actionsSearchInputRef}
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
        searchValue={searchValue}
        onSearchValueChange={handleSearchValueChange}
        searchInputRef={drawerSearchInputRef}
        activeGroupId={activeMobileGroup}
        menu={megaMenu}
        onClose={() => setMobileMenuOpen(false)}
        onSelectGroup={setActiveMobileGroup}
      />
    </header>
  );
};
