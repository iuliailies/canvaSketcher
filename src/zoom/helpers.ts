export function resetTransformStyle(element: HTMLElement): void {
  element.style.transform = "";
  element.classList.remove("zoomed");
}

export interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
}

export function isShortcutPressed(
  e: KeyboardEvent,
  shortcut: Shortcut
): boolean {
  const res =
    e.key.toLowerCase() === shortcut.key.toLowerCase() &&
    (shortcut.ctrl ? e.ctrlKey : true) &&
    (shortcut.shift ? e.shiftKey : true) &&
    (shortcut.alt ? e.altKey : true);
  return res;
}
