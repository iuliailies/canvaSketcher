import { SketcherHTMLElement } from "../models/sketcher-html-element";
import {
  getBoundary,
  isShortcutPressed,
  resetTransformStyle,
  updateElementBoundingRect,
  ZoomInOptions,
} from "./helpers";

export enum ZoomInMode {
  Spotlight = "SPOTLIGHT",
  Infiltrate = "INFILTRATE",
  PopUp = "POPUP",
}

export interface BoundingRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ElementBoundingRect {
  rect: BoundingRect;
  scroll: { x: number; y: number };
  zoom: number;
}

const modeFunctionAssosiation = new Map<
  ZoomInMode,
  (
    element: SketcherHTMLElement,
    options: ZoomInOptions,
    rect?: ElementBoundingRect
  ) => any
>([
  [ZoomInMode.Spotlight, handleSpotlight],
  [ZoomInMode.Infiltrate, handleInfiltrare],
  [ZoomInMode.PopUp, handlePopUp],
]);

export function zoomIn(
  element: SketcherHTMLElement,
  mode: ZoomInMode = ZoomInMode.Spotlight,
  options: ZoomInOptions = {},
  exitable?: HTMLElement,
  exitShortcut?: { key: string; ctrl?: boolean; shift?: boolean; alt?: boolean }
): void {
  // avoid zooming an element twice
  if (element.classList.contains("zoomed")) {
    return;
  }
  element.classList.add("zoomed");
  element.style.zIndex = "10000";
  const elementBoundingRect: ElementBoundingRect = {
    rect: element.getBoundingClientRect(),
    scroll: {
      x: document.documentElement.scrollLeft,
      y: document.documentElement.scrollTop,
    },
    zoom: 1,
  };
  modeFunctionAssosiation.get(mode)!(element, options, elementBoundingRect);
  let scrollEndTimer: any;
  let functionBinding = handleScrollEnd.bind(
    handleScrollEnd,
    element,
    mode,
    options,
    elementBoundingRect,
    scrollEndTimer
  );
  document.addEventListener("scroll", functionBinding);
  if (exitable) {
    exitable.addEventListener("click", function () {
      resetTransformStyle(element, options.transitionDuration);
      document.removeEventListener("scroll", functionBinding);
    });
  }
  if (exitShortcut) {
    document.addEventListener("keydown", (e) => {
      if (isShortcutPressed(e, exitShortcut)) {
        resetTransformStyle(element, options.transitionDuration);
        document.removeEventListener("scroll", functionBinding);
      }
    });
  }
}

function handleScrollEnd(
  element: SketcherHTMLElement,
  mode: ZoomInMode = ZoomInMode.Spotlight,
  options: ZoomInOptions = {},
  rect: ElementBoundingRect,
  timer: any,
  _: Event
): void {
  clearTimeout(timer);
  timer = setTimeout(() => {
    modeFunctionAssosiation.get(mode)!(element, options, rect);
  }, 50);
}

function handleSpotlight(
  element: SketcherHTMLElement,
  options: ZoomInOptions
): void {}

function handleInfiltrare(
  element: SketcherHTMLElement,
  options: ZoomInOptions
): void {}

function handlePopUp(
  element: SketcherHTMLElement,
  options: ZoomInOptions,
  rect?: ElementBoundingRect
): void {
  const elementBoundingRect: BoundingRect = rect
    ? updateElementBoundingRect(rect)
    : element.getBoundingClientRect();

  const xTranslation =
    window.innerWidth / 2 -
    (elementBoundingRect.left + elementBoundingRect.width / 2);
  const yTranslation =
    window.innerHeight / 2 -
    (elementBoundingRect.top + elementBoundingRect.height / 2);
  const boundary = getBoundary(options.boundary);
  const scaleWidth = (window.innerWidth - boundary) / elementBoundingRect.width;
  const scaleHeight =
    (window.innerHeight - boundary) / elementBoundingRect.height;
  const scale = scaleWidth < scaleHeight ? scaleWidth : scaleHeight;
  element.style.transform = `translate(${xTranslation}px, ${yTranslation}px) scale(${scale}) `;
  element.style.transitionDelay = options.transitionDelay + "s" || "0s";
  element.style.transitionDuration = options.transitionDuration + "s" || "0s";
  if (options.transitionCurve) {
    element.style.transitionTimingFunction = options.transitionCurve;
  }
}
