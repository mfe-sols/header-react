import type { AuthUserInfo, HeaderLocale } from "../types";
import { GuestAuthActions } from "./GuestAuthActions";
import { IconClose, IconMenu, IconMoon, IconSearch, IconSun } from "./icons";
import { UserMenu } from "./UserMenu";

type HeaderActionsProps = {
  locale: HeaderLocale;
  searchPlaceholder: string;
  isDark: boolean;
  onToggleTheme: () => void;
  onLocaleChange: (next: HeaderLocale) => void;
  authUser?: AuthUserInfo | null;
  onSignOut?: () => void;
  userMenuText: {
    profile: string;
    signOut: string;
    openUserMenu: string;
  };
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  closeNavigationLabel: string;
  openNavigationLabel: string;
};

export const HeaderActions = ({
  locale,
  searchPlaceholder,
  isDark,
  onToggleTheme,
  onLocaleChange,
  authUser,
  onSignOut,
  userMenuText,
  mobileMenuOpen,
  onToggleMobileMenu,
  closeNavigationLabel,
  openNavigationLabel,
}: HeaderActionsProps) => (
  <div className="hdr-actions">
    <label className="hdr-search hdr-actions-search">
      <span className="icon"><IconSearch /></span>
      <input type="search" placeholder={searchPlaceholder} aria-label={searchPlaceholder} />
      <kbd>⌘K</kbd>
    </label>

    <div className="hdr-actions-group hdr-actions-utility">
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

    <div className="hdr-actions-group hdr-actions-account">
      {authUser ? (
        <UserMenu
          user={authUser}
          text={userMenuText}
          onSignOut={onSignOut}
        />
      ) : (
        <GuestAuthActions locale={locale} />
      )}
    </div>

    <button
      type="button"
      className="hdr-icon-btn hdr-menu-btn"
      onClick={onToggleMobileMenu}
      aria-label={mobileMenuOpen ? closeNavigationLabel : openNavigationLabel}
      aria-expanded={mobileMenuOpen}
    >
      {mobileMenuOpen ? <IconClose /> : <IconMenu />}
    </button>
  </div>
);
