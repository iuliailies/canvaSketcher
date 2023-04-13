import { Point } from "../drag/drag-environment";
import { Animated } from "../models/animated";
import { SketcherHTMLElement } from "../models/sketcher-html-element";
import { select } from "../selection/select";
import { Selection } from "../selection/selection";
import { isShortcutPressed } from "../showcase/helpers";
import { getElementFocusZoom } from "./helpers";
import {
  ZoomState,
  ZoomOptions,
  TargetOptions,
  defaultZoomOptions,
  defaultTargetOptions,
} from "./zoom.model";

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

  targets: HTMLElement[] = [];
  currentTarget?: HTMLElement;
  focusedQueue: Animated[] = [];

  zoomableTransformCoordinates = {
    x: 0,
    y: 0,
  };

  constructor(
    private zoomableContainer: HTMLElement,
    private zoomable: HTMLElement
  ) {}

  public apply(options: ZoomOptions = defaultZoomOptions): ZoomEnvironment {
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
          this.currentTarget = elem;
        });
        elem.addEventListener("mouseleave", () => {
          this.currentTarget = undefined;
        });
      });
    });
    return this;
  }

  public focus(
    target: HTMLElement,
    options: TargetOptions = defaultTargetOptions,
    exitable?: HTMLElement,
    exitShortcut?: {
      key: string;
      ctrl?: boolean;
      shift?: boolean;
      alt?: boolean;
    }
  ): Animated {
    const prevZoom = +(
      this.zoomable.getBoundingClientRect().width / this.zoomable.offsetWidth
    ).toFixed(1);

    const zoom = getElementFocusZoom(
      this.zoomableContainer,
      target,
      prevZoom,
      options.boundary || 0
    );

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

    const focused = new Animated(
      target,
      {
        x: this.zoomableTransformCoordinates.x,
        y: this.zoomableTransformCoordinates.y,
        zoom: prevZoom,
      },
      options
    );

    this.focusedQueue?.push(focused);

    // adjust translation coordinates to new zoom
    this.zoomableTransformCoordinates = {
      x: (this.zoomableTransformCoordinates.x * zoom) / prevZoom,
      y: (this.zoomableTransformCoordinates.y * zoom) / prevZoom,
    };

    focused.handleCallbacks("open");

    this.transformCanvas(
      this.zoomableTransformCoordinates.x + containerCenter.x - targetCenter.x,
      this.zoomableTransformCoordinates.y + containerCenter.y - targetCenter.y,
      zoom,
      options
    );

    this.handleExitCalls(focused, exitable, exitShortcut);

    return focused;
  }

  public unfocus(): Animated | undefined {
    const unfocused = this.focusedQueue?.pop();
    if (!unfocused) {
      return unfocused;
    }
    const prevTransform = unfocused.prevTransformValues!;
    this.transformCanvas(
      prevTransform.x,
      prevTransform.y,
      prevTransform.zoom,
      unfocused.options
    );
    unfocused.handleCallbacks("close");
    return unfocused;
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

  private handleExitCalls(
    focused: Animated,
    exitable?: HTMLElement,
    exitShortcut?: {
      key: string;
      ctrl?: boolean;
      shift?: boolean;
      alt?: boolean;
    }
  ): void {
    if (exitable) {
      exitable.addEventListener("click", () => {
        if (this.focusedQueue[this.focusedQueue.length - 1] === focused) {
          this.unfocus();
        }
      });
    }
    if (exitShortcut) {
      document.addEventListener("keydown", (e) => {
        if (
          isShortcutPressed(e, exitShortcut) &&
          this.focusedQueue[this.focusedQueue.length - 1] === focused
        ) {
          if (this.focusedQueue[this.focusedQueue.length - 1] === focused) {
            this.unfocus();
          }
        }
      });
    }
  }

  private zoomCallback(
    zoom: number,
    direction: -1 | 1,
    options: ZoomOptions,
    event: Event,
    mousePosition?: Point
  ): number {
    if (this.focusedQueue?.length) {
      return zoom;
    }
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
        ?.apply(this.zoomable, [event, zoom, this.currentTarget]);
      return prevZoom;
    }

    this.handleZoom(zoom, prevZoom, mousePosition);

    // call user defined function
    this.outsideFunctionBindings
      .get("zoom")
      ?.apply(this.zoomable, [event, zoom, this.currentTarget]);

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
    left: number,
    top: number,
    zoom: number,
    options?: TargetOptions
  ): void {
    this.zoomableTransformCoordinates = {
      x: left,
      y: top,
    };
    this.zoomable.style.transform = `translate(${left}px, ${top}px) scale(${zoom}) `;
    if (!options) {
      this.zoomable.style.removeProperty("transition");
      return;
    }
    this.zoomable.style.transition = `transform ${
      options.transitionDuration + "s" || "0s"
    } ${options.transitionCurve || ""} ${
      options.transitionDelay + "s" || "0s"
    }`;
  }
}
