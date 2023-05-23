import { PanEnvironment } from "./pan-environment";

export function pan(
  zoomableContainer: HTMLElement,
  zoomable: HTMLElement
): PanEnvironment {
  return new PanEnvironment(zoomableContainer, zoomable);
}
