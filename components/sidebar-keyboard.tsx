'use client';

import { useEffect } from 'react';
import { useSidebar } from 'fumadocs-ui/components/sidebar/base';

/** Complete keyboard dismissal for the standard mobile drawer. */
export function SidebarKeyboard() {
  const { open, mode, setOpen } = useSidebar();
  useEffect(() => {
    if (!open || mode !== 'drawer') return;
    const trigger = [...document.querySelectorAll<HTMLButtonElement>('button[aria-controls="nd-sidebar-mobile"]')]
      .find(button => !button.closest('#nd-sidebar-mobile') && button.getClientRects().length > 0);
    function dismiss(event: KeyboardEvent) {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      // A nested search dialog owns its first Escape; keep the directory open.
      if (event.target instanceof Element && event.target.closest('[role="dialog"],[role="menu"],[role="listbox"]')) return;
      event.preventDefault();
      setOpen(false);
      if (trigger?.isConnected) trigger.focus();
    }
    window.addEventListener('keydown', dismiss);
    return () => window.removeEventListener('keydown', dismiss);
  }, [open, mode, setOpen]);
  return null;
}
