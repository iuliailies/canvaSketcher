import { Point } from "../drag/drag-environment";
import { SketcherHTMLElement } from "../models/sketcher-html-element";
import { select } from "../selection/select";
import { Selection } from "../selection/selection";
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
    (
      this: SketcherHTMLElement,
      eventObj: Event,
      zoom: number,
      target: HTMLElement | undefined
    ) => any
  >();

  defaultOptions: ZoomOptions = {
    step: 0.1,
    method: {
      type: "mouse",
      ctrlKey: true,
    },
  };

  targets: HTMLElement[] = [];
  activeTarget?: HTMLElement;
  zoomableTransformCoordinates = {
    left: 0,
    top: 0,
  };

  constructor(
    private zoomableContainer: HTMLElement,
    private zoomable: HTMLElement
  ) {}

  public apply(options: ZoomOptions = this.defaultOptions): ZoomEnvironment {
    let zoom = +(
      this.zoomable.getBoundingClientRect().width / this.zoomable.offsetWidth
    ).toFixed(1);

    const method = options.method ? options.method.type : "mouse";

    if (method === "mouse") {
      this.zoomableContainer.addEventListener("wheel", (event: WheelEvent) => {
        if (
          !options.method ||
          (options.method && options.method.ctrlKey === event.ctrlKey)
        ) {
          const direction = event.deltaY < 0 ? -1 : 1;
          const mousePosition = { x: event.pageX, y: event.pageY };
          zoom = this.zoomCallback(
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
            zoom = this.zoomCallback(zoom, direction, options, event);
          }
        }
      });
    }
    return this;
  }

  public targetable(selection: Selection): ZoomEnvironment {
    selection.elements.forEach((elems) => {
      elems.forEach((elem) => {
        this.targets.push(elem);
        elem.addEventListener("mouseenter", () => {
          this.activeTarget = elem;
        });
        elem.addEventListener("mouseleave", () => {
          this.activeTarget = undefined;
        });
      });
    });
    return this;
  }

  public focus(target: HTMLElement): ZoomEnvironment {
    const prevZoom = +(
      this.zoomable.getBoundingClientRect().width / this.zoomable.offsetWidth
    ).toFixed(1);
    const zoom = this.getElementZoom(target, prevZoom);

    const targetRect = target.getBoundingClientRect();
    const containerRect = this.zoomableContainer.getBoundingClientRect();

    // center point coordinate of the element, after the new zoom will be applied
    const targetCenter = {
      x:
        containerRect.left +
        ((targetRect.left - containerRect.left + targetRect.width / 2) * zoom) /
          prevZoom,
      y:
        containerRect.top +
        ((targetRect.top - containerRect.top + targetRect.height / 2) * zoom) /
          prevZoom,
    };

    // center point coordinate of the zoomable container; independent of the zoom value
    const containerCenter = {
      x: containerRect.left + containerRect.width / 2,
      y: containerRect.top + containerRect.height / 2,
    };

    // adjust translation coordinates to new zoom
    this.zoomableTransformCoordinates = {
      left: (this.zoomableTransformCoordinates.left * zoom) / prevZoom,
      top: (this.zoomableTransformCoordinates.top * zoom) / prevZoom,
    };

    this.transformCanvas(
      this.zoomable,
      this.zoomableTransformCoordinates.left +
        containerCenter.x -
        targetCenter.x,
      this.zoomableTransformCoordinates.top +
        containerCenter.y -
        targetCenter.y,
      zoom
    );
    return this;
  }

  public on(
    state: ZoomState,
    action: (
      this: SketcherHTMLElement,
      eventObj: Event,
      zoom: number,
      target: HTMLElement | undefined
    ) => any
  ): ZoomEnvironment {
    this.outsideFunctionBindings.set(state, action);
    return this;
  }

  private zoomCallback(
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
      this.outsideFunctionBindings
        .get("zoom")
        ?.apply(this.zoomable, [event, zoom, this.activeTarget]);
      return prevZoom;
    }

    this.handleZoom(zoom, prevZoom, mousePosition);

    // call user defined function
    this.outsideFunctionBindings
      .get("zoom")
      ?.apply(this.zoomable, [event, zoom, this.activeTarget]);

    return zoom;
  }

  private handleZoom(
    zoom: number,
    prevZoom: number,
    centerPoint?: Point
  ): void {
    const translationCoordinates: Point = this.getZoomableTranslation(
      zoom,
      prevZoom,
      centerPoint
    );
    this.transformCanvas(
      this.zoomable,
      translationCoordinates.x,
      translationCoordinates.y,
      zoom
    );
  }

  private getZoomableTranslation(
    zoom: number,
    prevZoom: number,
    centerPoint?: Point
  ): Point {
    const zoomableContainerRect =
      this.zoomableContainer.getBoundingClientRect();
    const zoomableRect = this.zoomable.getBoundingClientRect();

    select(this.zoomable).style("transform-origin", "0 0");

    // no mouse position specified => zoom towards the center
    const zoomCenter: Point = {
      x:
        (!centerPoint
          ? zoomableContainerRect.left + zoomableContainerRect.width / 2
          : centerPoint.x) - document.documentElement.scrollLeft,
      y:
        (!centerPoint
          ? zoomableContainerRect.top + zoomableContainerRect.height / 2
          : centerPoint.y) - document.documentElement.scrollTop,
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

    const translation: Point = {
      x: Math.round(
        zoomCenter.x -
          zoomableContainerRect.left -
          xPercent * ((zoomableRect.width * zoom) / prevZoom)
      ),
      y: Math.round(
        zoomCenter.y -
          zoomableContainerRect.top -
          yPercent * ((zoomableRect.height * zoom) / prevZoom)
      ),
    };

    return translation;
  }

  private transformCanvas(
    zoomable: HTMLElement,
    left: number,
    top: number,
    zoom: number
  ): void {
    this.zoomableTransformCoordinates = {
      left: left,
      top: top,
    };
    zoomable.style.transform = `translate(${left}px, ${top}px) scale(${zoom}) `;
  }

  // calculates the zoom needed to focus an element inside the zoomable
  private getElementZoom(element: HTMLElement, prevZoom: number): number {
    const zoomableContainerRect =
      this.zoomableContainer.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const heightZoom =
      zoomableContainerRect.height / (elementRect.height / prevZoom);
    const widthZoom =
      zoomableContainerRect.width / (elementRect.width / prevZoom);
    return heightZoom < widthZoom ? heightZoom : widthZoom;
  }
}
