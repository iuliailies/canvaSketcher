import { Point } from "../drag/drag-environment";
import { Animated } from "../models/animated";
import { SketcherHTMLElement } from "../models/sketcher-html-element";
import { select } from "../selection/select";
import { Selection } from "../selection/selection";
import { isShortcutPressed } from "../pop-up/helpers";
import { getElement2DTransform, getElementFocusZoom } from "./helpers";
import {
  ZoomState,
  ZoomOptions,
  TargetOptions,
  defaultZoomOptions,
  defaultTargetOptions,
} from "./zoom.model";
import { pan } from "../pan/pan";
import { PanEnvironment } from "../pan/pan-environment";

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
  focusedStack: Animated[] = [];
  zoom: number = 1;

  constructor(
    private zoomableContainer: HTMLElement,
    private zoomable: HTMLElement,
    private focusLimit?: number
  ) {}

  public apply(options: ZoomOptions = defaultZoomOptions): ZoomEnvironment {
    this.zoom = +(
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
          this.zoomCallback(direction, options, event, mousePosition);
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
            this.zoomCallback(direction, options, event);
          }
        }
      });
    }
    return this;
  }

  public pannable(): PanEnvironment {
    return pan(this.zoomableContainer, this.zoomable).apply();
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
    if (
      this.focusLimit !== undefined &&
      this.focusLimit <= this.focusedStack.length
    ) {
      return new Animated(target);
    }

    const prevTransformValue = getElement2DTransform(this.zoomable);

    const zoom = getElementFocusZoom(
      this.zoomableContainer,
      target,
      prevTransformValue.zoom,
      options.boundary || 0
    );

    const targetRect = target.getBoundingClientRect();
    const containerRect = this.zoomableContainer.getBoundingClientRect();

    // center point coordinate of the element, after the new zoom will be applied
    const targetCenter = {
      x:
        containerRect.left +
        ((targetRect.left - containerRect.left + targetRect.width / 2) * zoom) /
          prevTransformValue.zoom,
      y:
        containerRect.top +
        ((targetRect.top - containerRect.top + targetRect.height / 2) * zoom) /
          prevTransformValue.zoom,
    };

    // center point coordinate of the zoomable container; independent of the zoom value
    const containerCenter = {
      x: containerRect.left + containerRect.width / 2,
      y: containerRect.top + containerRect.height / 2,
    };

    const focused = new Animated(target, prevTransformValue, options);

    this.focusedStack?.push(focused);

    focused.handleCallbacks("open");

    this.transformCanvas(
      (prevTransformValue.x * zoom) / prevTransformValue.zoom +
        containerCenter.x -
        targetCenter.x,
      (prevTransformValue.y * zoom) / prevTransformValue.zoom +
        containerCenter.y -
        targetCenter.y,
      zoom,
      options
    );

    this.handleExitCalls(focused, exitable, exitShortcut);

    return focused;
  }

  public unfocus(): Animated | undefined {
    const unfocused = this.focusedStack?.pop();
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

  public reset(): ZoomEnvironment {
    this.zoomable.style.transform = `translateX(0px) translateY(0px) scale(1) `;
    this.zoom = 1;
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
        if (this.focusedStack[this.focusedStack.length - 1] === focused) {
          this.unfocus();
        }
      });
    }
    if (exitShortcut) {
      document.addEventListener("keydown", (e) => {
        if (
          isShortcutPressed(e, exitShortcut) &&
          this.focusedStack[this.focusedStack.length - 1] === focused
        ) {
          if (this.focusedStack[this.focusedStack.length - 1] === focused) {
            this.unfocus();
          }
        }
      });
    }
  }

  private zoomCallback(
    direction: -1 | 1,
    options: ZoomOptions,
    event: Event,
    mousePosition?: Point
  ): void {
    if (this.focusedStack?.length) {
      return;
    }
    const step = options.step !== undefined ? options.step : 0.1;
    const prevZoom = this.zoom;

    this.zoom += direction > 0 ? -step : step;
    if (
      (options.upperBound && this.zoom >= options.upperBound) ||
      (options.lowerBound && this.zoom <= options.lowerBound)
    ) {
      // call user defined function
      this.outsideFunctionBindings
        .get("zoom")
        ?.apply(this.zoomable, [event, this.zoom, this.currentTarget]);
      this.zoom = prevZoom;
      return;
    }

    this.handleZoom(this.zoom, prevZoom, mousePosition);

    // call user defined function
    this.outsideFunctionBindings
      .get("zoom")
      ?.apply(this.zoomable, [event, this.zoom, this.currentTarget]);

    return;
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

    const translation: Point = {
      x: Math.round(
        zoomCenter.x -
          zoomableContainerRect.left -
          (zoomableContainerRect.width - this.zoomableContainer.clientWidth) /
            2 - // get border
          +(zoomCenter.x - zoomableRect.left) * (zoom / prevZoom)
      ),
      y: Math.round(
        zoomCenter.y -
          zoomableContainerRect.top -
          (zoomableContainerRect.height - this.zoomableContainer.clientHeight) /
            2 - // get border
          +(zoomCenter.y - zoomableRect.top) * (zoom / prevZoom)
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
    this.zoomable.style.transform = `translateX(${left}px) translateY(${top}px) scale(${zoom}) `;
    if (!options) {
      this.zoomable.style.removeProperty("transition");
      return;
    }
    this.zoomable.style.transition = `transform ${
      options.transitionDuration ? options.transitionDuration + "s" : "0s"
    } ${options.transitionCurve || "linear"} ${
      options.transitionDelay ? options.transitionDelay + "s" : "0s"
    }`;
  }
}
