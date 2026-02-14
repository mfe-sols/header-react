import { useCallback, useEffect, useRef, useState } from "react";
import type { HeaderMenuGroup } from "../header.config";
import { isExternalHttpHref } from "../helpers";
import { useClickOutside } from "../hooks/useClickOutside";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { IconArrowRight, IconChevron } from "./icons";

type DesktopNavItemProps = {
  item: HeaderMenuGroup;
};

export const DesktopNavItem = ({ item }: DesktopNavItemProps) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const queueClose = useCallback(() => {
    cancelClose();
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
    }, 120);
  }, [cancelClose]);

  const closePopover = useCallback(() => {
    cancelClose();
    setOpen(false);
  }, [cancelClose]);

  useClickOutside(wrapRef, closePopover, open);
  useEscapeKey(closePopover, open);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="hdr-nav-item"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={queueClose}
    >
      <button
        type="button"
        className={`hdr-nav-trigger ${open ? "is-open" : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{item.label}</span>
        <IconChevron />
      </button>

      <div className={`hdr-nav-popover ${open ? "is-open" : ""}`} role="menu" aria-hidden={!open}>
        <div className="hdr-nav-popover-grid">
          {item.columns.map((column) => (
            <section key={column.id} className="hdr-nav-col">
              <h3>{column.title}</h3>
              <div className="hdr-nav-links">
                {column.links.map((link) => {
                  const isExternal = isExternalHttpHref(link.href);
                  return (
                    <a
                      key={link.id}
                      href={link.href}
                      className="hdr-nav-link"
                      role="menuitem"
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                    >
                      <span className="hdr-nav-link-main">{link.text}</span>
                      <span className="hdr-nav-link-desc">{link.desc}</span>
                      <span className="hdr-nav-link-arrow" aria-hidden="true">
                        <IconArrowRight />
                      </span>
                    </a>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};
