import { SketcherHTMLElement } from "../models/sketcher-html-element";
import { isShortcutPressed, resetTransformStyle } from "./helpers";

export enum ZoomInMode {
  Spotlight = "SPOTLIGHT",
  Infiltrate = "INFILTRATE",
  PopUp = "POPUP",
}

const modeFunctionAssosiation = new Map<
  ZoomInMode,
  (element: SketcherHTMLElement) => any
>([
  [ZoomInMode.Spotlight, handleSpotlight],
  [ZoomInMode.Infiltrate, handleInfiltrare],
  [ZoomInMode.PopUp, handlePopUp],
]);

export function zoomIn(
  element: SketcherHTMLElement,
  mode: ZoomInMode = ZoomInMode.Spotlight,
  exitable?: HTMLElement,
  exitShortcut?: { key: string; ctrl?: boolean; shift?: boolean; alt?: boolean }
): void {
  // avoid zooming an element twice
  if (element.classList.contains("zoomed")) {
    return;
  }
  element.classList.add("zoomed");
  modeFunctionAssosiation.get(mode)!(element);
  if (exitable) {
    exitable.addEventListener("click", function () {
      resetTransformStyle(element);
    });
  }
  if (exitShortcut) {
    document.addEventListener("keydown", (e) => {
      if (isShortcutPressed(e, exitShortcut)) {
        resetTransformStyle(element);
      }
    });
  }
}

function handleSpotlight(element: SketcherHTMLElement): void {}

function handleInfiltrare(element: SketcherHTMLElement): void {}

function handlePopUp(element: SketcherHTMLElement): void {
  const elementBoundingRect = element.getBoundingClientRect();
  const xTranslation =
    window.innerWidth / 2 -
    (elementBoundingRect.left + elementBoundingRect.width / 2);
  const yTranslation =
    window.innerWidth / 2 -
    (elementBoundingRect.left + elementBoundingRect.width / 2);
  const scaleWidth = window.innerWidth / elementBoundingRect.width;
  const scaleHeight = window.innerHeight / elementBoundingRect.height;
  const scale = scaleWidth < scaleHeight ? scaleWidth : scaleHeight;
  element.style.transform = `translate(${xTranslation}px, ${yTranslation}px) scale(${scale}) `;
}
