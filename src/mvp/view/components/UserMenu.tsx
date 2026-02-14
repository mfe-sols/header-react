import { useMemo, useRef, useState } from "react";
import type { AuthUserInfo } from "../types";
import { useClickOutside } from "../hooks/useClickOutside";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { getInitials, getSafeImageSrc } from "../helpers";
import { IconLogout, IconUser } from "./icons";

type UserMenuProps = {
  user: AuthUserInfo;
  text: {
    profile: string;
    signOut: string;
    openUserMenu: string;
  };
  onSignOut?: () => void;
};

export const UserMenu = ({ user, text, onSignOut }: UserMenuProps) => {
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const displayName = user.displayName || user.name || user.email || "User";
  const initials = useMemo(() => getInitials(displayName), [displayName]);
  const photoSrc = useMemo(() => getSafeImageSrc(user.photoURL), [user.photoURL]);
  const hasPhoto = Boolean(photoSrc) && !imgError;

  const closeMenu = () => setOpen(false);
  useClickOutside(wrapRef, closeMenu, open);
  useEscapeKey(closeMenu, open);

  return (
    <div ref={wrapRef} className="hdr-user-wrap">
      <button
        type="button"
        className={`hdr-avatar-btn ${open ? "is-open" : ""}`}
        aria-label={text.openUserMenu}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        {hasPhoto ? (
          <img
            src={photoSrc ?? undefined}
            alt={displayName}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          <span>{initials}</span>
        )}
      </button>

      <div className={`hdr-user-menu ${open ? "is-open" : ""}`}>
        <div className="hdr-user-head">
          <div className="hdr-user-avatar">
            {hasPhoto ? (
              <img
                src={photoSrc ?? undefined}
                alt=""
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="hdr-user-meta">
            <strong>{displayName}</strong>
            {user.email ? <span>{user.email}</span> : null}
          </div>
        </div>

        <div className="hdr-user-actions">
          <a href="/profile" className="hdr-user-action">
            <IconUser />
            <span>{text.profile}</span>
          </a>
          <button
            type="button"
            className="hdr-user-action danger"
            onClick={() => {
              closeMenu();
              onSignOut?.();
            }}
          >
            <IconLogout />
            <span>{text.signOut}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
