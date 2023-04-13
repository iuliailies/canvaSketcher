import { TransformValue } from "../models/animated";

// calculates the zoom needed to focus an element inside the zoomable
export function getElementFocusZoom(
  container: HTMLElement,
  element: HTMLElement,
  prevZoom: number,
  boundary: number
): number {
  const zoomableContainerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const heightZoom =
    (zoomableContainerRect.height -
      2 * zoomableContainerRect.height * boundary) /
    (elementRect.height / prevZoom);
  const widthZoom =
    (zoomableContainerRect.width - 2 * zoomableContainerRect.width * boundary) /
    (elementRect.width / prevZoom);
  return heightZoom < widthZoom ? heightZoom : widthZoom;
}

// retrieves transform object for the given element
export function getElement2DTransform(element: HTMLElement): TransformValue {
  const returnValue: TransformValue = {
    x: 0,
    y: 0,
    zoom: +element.getBoundingClientRect().width / element.offsetWidth,
  };
  const matrix = window.getComputedStyle(element).transform;
  if (!matrix) {
    return returnValue;
  }
  const matrixValues = matrix.match(/matrix.*\((.+)\)/)![1].split(", ");
  returnValue.x = +matrixValues[4];
  returnValue.y = +matrixValues[5];

  return returnValue;
}
