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
