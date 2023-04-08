import { Point } from "../drag/drag-environment";
import { SketcherHTMLElement } from "../models/sketcher-html-element";
import { select } from "../selection/select";
import { isShortcutPressed } from "../showcase/helpers";

export type ZoomState = "zoom";

export interface ZoomOptions {
  // how much the zoom value should be incremented/decremented inside one callback;
  step?: number;
  // maximum zoom value
  upperBound?: number;
  // minimum zoom value
  lowerBound?: number;
  // method for triggering zoom behaviour;
  method?: {
    type: "mouse" | "keyboard";
    ctrlKey?: boolean;
  };
}

export class ZoomEnvironment {
  outsideFunctionBindings = new Map<
    ZoomState,
    (this: SketcherHTMLElement, eventObj: Event, zoom: number) => any
  >();

  defaultOptions: ZoomOptions = {
    step: 0.1,
    method: {
      type: "mouse",
      ctrlKey: true,
    },
  };
  constructor() {}

  public apply(
    zoomableContainer: HTMLElement,
    zoomable: HTMLElement,
    options: ZoomOptions = this.defaultOptions
  ): ZoomEnvironment {
    let zoom = +(
      zoomable.getBoundingClientRect().width / zoomable.offsetWidth
    ).toFixed(1);

    const method = options.method ? options.method.type : "mouse";

    if (method === "mouse") {
      zoomableContainer.addEventListener("wheel", (event: WheelEvent) => {
        if (
          !options.method ||
          (options.method && options.method.ctrlKey === event.ctrlKey)
        ) {
          const direction = event.deltaY < 0 ? -1 : 1;
          const mousePosition = { x: event.pageX, y: event.pageY };
          zoom = this.zoomCallback(
            zoomableContainer,
            zoomable,
            zoom,
            direction,
            options,
            event,
            mousePosition
          );
        }
      });
    } else {
      document.addEventListener("keydown", (event: KeyboardEvent) => {
        if (
          !options.method ||
          (options.method && options.method.ctrlKey === event.ctrlKey)
        ) {
          const direction = isShortcutPressed(event, { ctrl: true, key: "+" })
            ? -1
            : isShortcutPressed(event, { ctrl: true, key: "-" })
            ? 1
            : undefined;
          if (direction) {
            zoom = this.zoomCallback(
              zoomableContainer,
              zoomable,
              zoom,
              direction,
              options,
              event
            );
          }
        }
      });
    }
    return this;
  }

  public on(
    state: ZoomState,
    action: (this: SketcherHTMLElement, eventObj: Event, zoom: number) => any
  ): ZoomEnvironment {
    this.outsideFunctionBindings.set(state, action);
    return this;
  }

  private zoomCallback(
    zoomableContainer: HTMLElement,
    zoomable: HTMLElement,
    zoom: number,
    direction: -1 | 1,
    options: ZoomOptions,
    event: Event,
    mousePosition?: Point
  ): number {
    const step = options.step !== undefined ? options.step : 0.1;
    const prevZoom = zoom;

    zoom += direction > 0 ? -step : step;
    if (
      (options.upperBound && zoom >= options.upperBound) ||
      (options.lowerBound && zoom <= options.lowerBound)
    ) {
      // call user defined function
      this.outsideFunctionBindings.get("zoom")?.apply(zoomable, [event, zoom]);
      return prevZoom;
    }

    this.handleZoom(zoomableContainer, zoomable, zoom, prevZoom, mousePosition);
    // call user defined function
    this.outsideFunctionBindings.get("zoom")?.apply(zoomable, [event, zoom]);

    return zoom;
  }

  private handleZoom(
    zoomableContainer: HTMLElement,
    zoomable: HTMLElement,
    zoom: number,
    prevZoom: number,
    mousePosition?: Point
  ): void {
    const zoomableContainerRect = zoomableContainer.getBoundingClientRect();
    const zoomableRect = zoomable.getBoundingClientRect();

    select(zoomable).style("transform-origin", "0 0");

    // no mouse position specified => zoom towards the center
    const zoomCenter: Point = {
      x:
        (!mousePosition
          ? zoomableContainerRect.left + zoomableContainerRect.width / 2
          : mousePosition.x) - document.documentElement.scrollLeft,
      y:
        (!mousePosition
          ? zoomableContainerRect.top + zoomableContainerRect.height / 2
          : mousePosition.y) - document.documentElement.scrollTop,
    };

    // avoid slight center deviation by approximating with 2 fixed decimals
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
