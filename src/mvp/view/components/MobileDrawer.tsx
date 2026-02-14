import { useId } from "react";
import type { HeaderMenuGroup } from "../header.config";
import { isExternalHttpHref } from "../helpers";
import { IconClose, IconSearch } from "./icons";

type MobileDrawerProps = {
  open: boolean;
  title: string;
  closeLabel: string;
  searchPlaceholder: string;
  activeGroupId: string;
  menu: HeaderMenuGroup[];
  onClose: () => void;
  onSelectGroup: (groupId: string) => void;
};

export const MobileDrawer = ({
  open,
  title,
  closeLabel,
  searchPlaceholder,
  activeGroupId,
  menu,
  onClose,
  onSelectGroup,
}: MobileDrawerProps) => {
  const titleId = useId();
  const activeGroup = menu.find((group) => group.id === activeGroupId) || menu[0];

  return (
    <>
      <div className={`hdr-drawer-overlay ${open ? "is-open" : ""}`} onClick={onClose} />

      <aside
        className={`hdr-drawer ${open ? "is-open" : ""}`}
        aria-hidden={!open}
        aria-modal="true"
        role="dialog"
        aria-labelledby={titleId}
      >
        <div className="hdr-drawer-head">
          <strong id={titleId}>{title}</strong>
          <button type="button" className="hdr-icon-btn" onClick={onClose} aria-label={closeLabel}>
            <IconClose />
          </button>
        </div>

        <label className="hdr-search hdr-search-drawer">
          <span className="icon"><IconSearch /></span>
          <input type="search" placeholder={searchPlaceholder} aria-label={searchPlaceholder} />
        </label>

        <div className="hdr-drawer-tabs" role="tablist">
          {menu.map((group) => (
            <button
              key={`drawer-tab-${group.id}`}
              type="button"
              role="tab"
              aria-selected={group.id === activeGroupId}
              className={group.id === activeGroupId ? "is-active" : ""}
              onClick={() => onSelectGroup(group.id)}
            >
              {group.label}
            </button>
          ))}
        </div>

        <div className="hdr-drawer-content">
          {activeGroup?.columns.map((column) => (
            <section key={column.id} className="hdr-drawer-section">
              <h4>{column.title}</h4>
              <div className="hdr-drawer-links">
                {column.links.map((link) => {
                  const isExternal = isExternalHttpHref(link.href);
                  return (
                    <a
                      key={link.id}
                      href={link.href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                    >
                      <span className="main">{link.text}</span>
                      <span className="desc">{link.desc}</span>
                    </a>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </aside>
    </>
  );
};
