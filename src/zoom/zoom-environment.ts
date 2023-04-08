import { Point } from "../drag/drag-environment";
import { SketcherHTMLElement } from "../models/sketcher-html-element";
import { select } from "../selection/select";

export type ZoomState = "zoom";

export class ZoomEnvironment {
  outsideFunctionBindings = new Map<
    ZoomState,
    (this: SketcherHTMLElement, eventObj: Event, zoom: number) => any
  >();
  constructor() {}

  public apply(
    zoomableContainer: HTMLElement,
    zoomable: HTMLElement,
    zoom: number = 1
  ): ZoomEnvironment {
    zoomableContainer.addEventListener("wheel", (event: WheelEvent) => {
      const prevZoom = zoom;
      zoom += event.deltaY > 0 ? -0.1 : 0.1;
      const mousePosition = { x: event.pageX, y: event.pageY };
      this.handleZoom(
        zoomableContainer,
        zoomable,
        zoom,
        prevZoom,
        mousePosition
      );
      // call user defined function
      this.outsideFunctionBindings.get("zoom")?.apply(zoomable, [event, zoom]);
    });
    return this;
  }

  public on(
    state: ZoomState,
    action: (this: SketcherHTMLElement, eventObj: Event, zoom: number) => any
  ): ZoomEnvironment {
    this.outsideFunctionBindings.set(state, action);
    return this;
  }

  private handleZoom(
    zoomableContainer: HTMLElement,
    zoomable: HTMLElement,
    zoom: number,
    prevZoom: number,
    mousePosition: Point,
    onCenter: boolean = false
  ): void {
    const zoomableContainerRect = zoomableContainer.getBoundingClientRect();
    const zoomableRect = zoomable.getBoundingClientRect();

    select(zoomable).style("transform-origin", "0 0");

    const zoomCenter: Point = {
      x:
        (onCenter
          ? zoomableContainerRect.left + zoomableContainerRect.width / 2
          : mousePosition.x) - document.documentElement.scrollLeft,
      y:
        (onCenter
          ? zoomableContainerRect.top + zoomableContainerRect.height / 2
          : mousePosition.y) - document.documentElement.scrollTop,
    };

    // avoid slight center deviation by approximating at 2 fixed decimals
    let xPercent = +(
      (zoomCenter.x - zoomableRect.left) /
      zoomableRect.width
    ).toFixed(2);
    let yPercent = +(
      (zoomCenter.y - zoomableRect.top) /
      zoomableRect.height
    ).toFixed(2);

    const left = Math.round(
      zoomCenter.x -
        zoomableContainerRect.left -
        xPercent * ((zoomableRect.width * zoom) / prevZoom)
    );
    const top = Math.round(
      zoomCenter.y -
        zoomableContainerRect.top -
        yPercent * ((zoomableRect.height * zoom) / prevZoom)
    );

    this.transformCanvas(zoomable, left, top, zoom);
  }

  transformCanvas(
    zoomable: HTMLElement,
    left: number,
    top: number,
    zoom: number
  ): void {
    zoomable.style.transform = `translate(${left}px, ${top}px) scale(${zoom}) `;
  }
}
