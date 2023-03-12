import { SketcherHTMLElement } from "../models/sketcher-html-element";
import {
  getBoundary,
  isShortcutPressed,
  resetTransformStyle,
  ZoomInOptions,
} from "./helpers";

export enum ZoomInMode {
  Spotlight = "SPOTLIGHT",
  Infiltrate = "INFILTRATE",
  PopUp = "POPUP",
}

const modeFunctionAssosiation = new Map<
  ZoomInMode,
  (element: SketcherHTMLElement, options: ZoomInOptions) => any
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
  modeFunctionAssosiation.get(mode)!(element, options);
  if (exitable) {
    exitable.addEventListener("click", function () {
      resetTransformStyle(element, options.transitionDuration);
    });
  }
  if (exitShortcut) {
    document.addEventListener("keydown", (e) => {
      if (isShortcutPressed(e, exitShortcut)) {
        resetTransformStyle(element, options.transitionDuration);
      }
    });
  }
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
  options: ZoomInOptions
): void {
  const elementBoundingRect = element.getBoundingClientRect();
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
