import { Animated } from "../models/animated";
import { SketcherHTMLElement } from "../models/sketcher-html-element";
import {
  getBoundary,
  isShortcutPressed,
  resetTransformStyle,
  updateElementBoundingRect,
  PopUpOptions,
  poppedOutClass,
} from "./helpers";

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

export function popup(
  element: SketcherHTMLElement,
  options: PopUpOptions = {},
  exitable?: HTMLElement,
  exitShortcut?: { key: string; ctrl?: boolean; shift?: boolean; alt?: boolean }
): Animated {
  let showcased = new Animated(element, undefined, options);
  // avoid zooming an element twice on popup
  if (element.classList.contains(poppedOutClass)) {
    return showcased;
  }

  element.classList.add(poppedOutClass);
  element.style.zIndex = "10000";
  const elementBoundingRect: ElementBoundingRect = {
    rect: element.getBoundingClientRect(),
    scroll: {
      x: document.documentElement.scrollLeft,
      y: document.documentElement.scrollTop,
    },
    zoom: 1,
  };
  handlePopUp(element, options, elementBoundingRect);
  showcased.handleCallbacks("open");
  let scrollEndTimer: any;
  let functionBinding = handleScrollEnd.bind(
    handleScrollEnd,
    element,
    options,
    elementBoundingRect,
    scrollEndTimer
  );
  document.addEventListener("scroll", functionBinding);
  if (exitable) {
    exitable.addEventListener("click", function () {
      resetTransformStyle(element, options.transitionDuration);
      document.removeEventListener("scroll", functionBinding);
      showcased.handleCallbacks("close");
    });
  }
  if (exitShortcut) {
    document.addEventListener("keydown", (e) => {
      if (isShortcutPressed(e, exitShortcut)) {
        resetTransformStyle(element, options.transitionDuration);
        document.removeEventListener("scroll", functionBinding);
        showcased.handleCallbacks("close");
      }
    });
  }
  return showcased;
}

function handleScrollEnd(
  element: SketcherHTMLElement,
  options: PopUpOptions = {},
  rect: ElementBoundingRect,
  timer: any,
  _: Event
): void {
  clearTimeout(timer);
  timer = setTimeout(() => {
    handlePopUp(element, options, rect);
  }, 50);
}

function handlePopUp(
  element: SketcherHTMLElement,
  options: PopUpOptions,
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
  element.style.transitionProperty = `transform`;
  element.style.transitionDelay = options.transitionDelay + "s" || "0s";
  element.style.transitionDuration = options.transitionDuration + "s" || "0s";
  if (options.transitionCurve) {
    element.style.transitionTimingFunction = options.transitionCurve;
  }
}
