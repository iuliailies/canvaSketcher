import { BoundingRect, ElementBoundingRect } from "./zoom-in";

export function resetTransformStyle(
  element: HTMLElement,
  delay?: number
): void {
  element.style.transform = "";
  setTimeout(() => {
    element.classList.remove("zoomed");
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
    (shortcut.shift ? e.shiftKey : true) &&
    (shortcut.alt ? e.altKey : true);
  return res;
}

export interface ZoomInOptions {
  transitionDelay?: number;
  transitionDuration?: number;
  transitionCurve?: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out";
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
