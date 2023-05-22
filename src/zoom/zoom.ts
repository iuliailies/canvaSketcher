import { ZoomEnvironment } from "./zoom-environment";

export function zoom(
  zoomableContainer: HTMLElement,
  zoomable: HTMLElement,
  focusLimit?: number
): ZoomEnvironment {
  return new ZoomEnvironment(zoomableContainer, zoomable, focusLimit);
}
