import { ZoomEnvironment } from "./zoom-environment";

export function zoom(
  zoomableContainer: HTMLElement,
  zoomable: HTMLElement
): ZoomEnvironment {
  return new ZoomEnvironment(zoomableContainer, zoomable);
}
