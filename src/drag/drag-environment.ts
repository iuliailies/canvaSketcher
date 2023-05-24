import { SketcherHTMLElement } from "../models/sketcher-html-element";
import { select } from "../selection/select";
import { Selection } from "../selection/selection";

export interface Point {
  x: number;
  y: number;
}

export interface DragOptions {
  container?: HTMLElement; // TODO
  scale?: number;
  threshold?: number;
  disableEvents?: boolean;
}

interface DragInstance {
  mouseStartPosition: Point;
  elementStartPosition: Point;
  dragging: boolean;
  // keeping instances of the mousemove and mouseup function binding, because we only want to listen to these
  // mouse events after a mouse down and until a mouse up
  moveFunctionBinding?: (ev: MouseEvent) => void;
  upFunctionBinding?: (ev: MouseEvent) => void;
}

export type DragState = "start" | "drag" | "end";
export type MouseState = "mousedown" | "mousemove" | "mouseup";

export class DragEnvironment {
  outsideFunctionBindings = new Map<
    DragState,
    (
      this: SketcherHTMLElement,
      eventObj: Event,
      data: any,
      index: number
    ) => any
  >();
  disabled = false;

  constructor() {}

  public apply(selection: Selection, options?: DragOptions): DragEnvironment {
    let pointer = 0;
    selection?.elements.forEach((elems) => {
      elems.forEach((elem) => {
        let dragInstance: DragInstance = {
          mouseStartPosition: {
            x: 0,
            y: 0,
          },
          elementStartPosition: {
            x: 0,
            y: 0,
          },
          dragging: false,
        };
        let downFunctionBinding = this.handleMouseDown.bind(
          this,
          elem,
          dragInstance,
          options || {},
          pointer
        );
        elem.addEventListener("mousedown", downFunctionBinding);
        pointer++;
      });
    });
    return this;
  }

  public on(
    state: DragState,
    action: (
      this: SketcherHTMLElement,
      eventObj: Event,
      data: any,
      index: number
    ) => any
  ): DragEnvironment {
    this.outsideFunctionBindings.set(state, action);
    return this;
  }

  private handleMouseDown(
    elem: SketcherHTMLElement,
    dragInstance: DragInstance,
    options: DragOptions,
    index: number,
    ev: MouseEvent
  ): void {
    if (this.disabled) {
      return;
    }

    ev.preventDefault();
    ev.stopImmediatePropagation();

    dragInstance.mouseStartPosition = {
      x: +ev.x,
      y: +ev.y,
    };

    dragInstance.elementStartPosition = {
      x: parseInt(elem.style.left, 10) || 0,
      y: parseInt(elem.style.top, 10) || 0,
    };

    let moveFunctionBinding = this.handleMouseMove.bind(
      this,
      elem,
      dragInstance,
      options,
      index
    );
    dragInstance.moveFunctionBinding = moveFunctionBinding;

    let upFunctionBinding = this.handleMouseUp.bind(
      this,
      elem,
      dragInstance,
      options,
      index
    );
    dragInstance.upFunctionBinding = upFunctionBinding;

    document.addEventListener("mousemove", moveFunctionBinding);
    document.addEventListener("mouseup", upFunctionBinding);
  }

  private handleMouseMove(
    elem: SketcherHTMLElement,
    dragInstance: DragInstance,
    options: DragOptions,
    index: number,
    ev: MouseEvent
  ): void {
    ev.preventDefault();
    ev.stopImmediatePropagation();

    const scale = options.scale
      ? options.scale
      : elem.getBoundingClientRect().width / elem.offsetWidth;

    // prevent drag behaviour if Manhattan distance from the initial position to the current one < threshold
    if (options.threshold) {
      if (
        Math.abs(ev.x - dragInstance.mouseStartPosition.x) +
          Math.abs(ev.y - dragInstance.mouseStartPosition.y) / (scale || 1) <
        options.threshold
      ) {
        return;
      }
    }

    if (!dragInstance.dragging) {
      // start of drag behaviour
      dragInstance.dragging = true;

      // call user defined function
      this.outsideFunctionBindings
        .get("start")
        ?.apply(elem, [ev, elem.data, index]);

      if (options.disableEvents) {
        elem.style.pointerEvents = "none";
      }
    }

    select(elem).style(
      "left",
      dragInstance.elementStartPosition.x +
        (ev.x - dragInstance.mouseStartPosition.x) / (scale || 1) +
        "px"
    );
    select(elem).style(
      "top",
      dragInstance.elementStartPosition.y +
        (ev.y - dragInstance.mouseStartPosition.y) / (scale || 1) +
        "px"
    );

    // disable unwanted background selection caused by mouse movement
    document.getSelection()?.removeAllRanges();

    // call user defined function
    this.outsideFunctionBindings
      .get("drag")
      ?.apply(elem, [ev, elem.data, index]);
  }

  private handleMouseUp(
    elem: SketcherHTMLElement,
    dragInstance: DragInstance,
    options: DragOptions,
    index: number,
    ev: MouseEvent
  ): void {
    ev.preventDefault();
    ev.stopImmediatePropagation();

    if (options.disableEvents) {
      elem.style.pointerEvents = "auto";
    }

    if (!dragInstance.moveFunctionBinding || !dragInstance.upFunctionBinding) {
      return;
    }

    document.removeEventListener("mousemove", dragInstance.moveFunctionBinding);
    document.removeEventListener("mouseup", dragInstance.upFunctionBinding);
    dragInstance.moveFunctionBinding = undefined;
    dragInstance.upFunctionBinding = undefined;
    if (dragInstance.dragging) {
      // call user defined function
      this.outsideFunctionBindings
        .get("end")
        ?.apply(elem, [ev, elem.data, index]);
    }
    dragInstance.dragging = false;
  }
}
