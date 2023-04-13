import { AnimatedOptions } from "../models/animated";
import { BoundingRect, ElementBoundingRect } from "./pop-up";

export const poppedOutClass = "popped-out";

export function resetTransformStyle(
  element: HTMLElement,
  delay?: number,
  prevTransform?: string
): void {
  element.style.transform = prevTransform || "";
  setTimeout(() => {
    element.classList.remove(poppedOutClass);
    element.style.removeProperty("z-index");
  }, (delay || 0) * 1000);
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
    (!shortcut.ctrl && e.ctrlKey ? false : true) &&
    (shortcut.shift ? e.shiftKey : true) &&
    (!shortcut.shift && e.shiftKey ? false : true) &&
    (shortcut.alt ? e.altKey : true) &&
    (!shortcut.alt && e.altKey ? false : true);

  return res;
}

export interface PopUpOptions extends AnimatedOptions {
  // margin around the zoomed element; in percentage, relative to the window
  boundary?: string;
}

export function getBoundary(value?: string) {
  let boundary = 0;
  if (!value) return boundary;
  if (value.endsWith("%")) {
    const subvalue = value.slice(0, -1);
    const numeric = +subvalue;
    if (numeric) boundary = (window.innerHeight * numeric) / 100;
  } else {
    const numeric = +value;
    if (numeric) boundary = numeric;
  }
  return boundary;
}

export function updateElementBoundingRect(
  rect: ElementBoundingRect
): BoundingRect {
  const currentScroll = {
    x: document.documentElement.scrollLeft,
    y: document.documentElement.scrollTop,
  };
  const updatedRect: BoundingRect = {
    left: rect.rect.left - currentScroll.x + rect.scroll.x,
    top: rect.rect.top - currentScroll.y + rect.scroll.y,
    width: rect.rect.width,
    height: rect.rect.height,
  };

  return updatedRect;
}
