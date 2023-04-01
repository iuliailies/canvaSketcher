import { SketcherHTMLElement } from "../models/sketcher-html-element";
import { select } from "../selection/select";
import { Selection } from "../selection/selection";

export interface Point {
  x: number;
  y: number;
}

export interface DragOptions {
  container?: HTMLElement;
  scale?: number; // TODO: check passing by refference?
  debounce?: number;
}

interface DragInstance {
  mouseStartPosition: Point;
  elementStartPosition: Point;
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
    (this: SketcherHTMLElement, eventObj: Event, data: any) => any
  >();
  constructor() {}

  public apply(selection: Selection, options?: DragOptions): DragEnvironment {
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
        };
        let downFunctionBinding = this.handleMouseDown.bind(
          this,
          elem,
          dragInstance,
          options || {}
        );
        elem.addEventListener("mousedown", downFunctionBinding);
      });
    });
    return this;
  }

  public on(
    state: DragState,
    action: (this: SketcherHTMLElement, eventObj: Event, data: any) => any
  ): DragEnvironment {
    this.outsideFunctionBindings.set(state, action);
    return this;
  }

  public handleMouseDown(
    elem: SketcherHTMLElement,
    dragInstance: DragInstance,
    options: DragOptions,
    ev: MouseEvent
  ): void {
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
      dragInstance.mouseStartPosition,
      dragInstance.elementStartPosition,
      options
    );
    dragInstance.moveFunctionBinding = moveFunctionBinding;

    let upFunctionBinding = this.handleMouseUp.bind(this, elem, dragInstance);
    dragInstance.upFunctionBinding = upFunctionBinding;

    document.addEventListener("mousemove", moveFunctionBinding);
    document.addEventListener("mouseup", upFunctionBinding);

    // call user defined function
    this.outsideFunctionBindings.get("start")?.apply(elem, [ev, elem.data]);
  }

  public handleMouseMove(
    elem: SketcherHTMLElement,
    mouseStartPosition: Point,
    elementStartPosition: Point,
    options: DragOptions,
    ev: MouseEvent
  ): void {
    select(elem).style(
      "left",
      elementStartPosition.x +
        (ev.x - mouseStartPosition.x) / (options?.scale || 1) +
        "px"
    );
    select(elem).style(
      "top",
      elementStartPosition.y +
        (ev.y - mouseStartPosition.y) / (options?.scale || 1) +
        "px"
    );
    // disable unwanted background selection caused by mouse movement
    document.getSelection()?.removeAllRanges();

    // call user defined function
    this.outsideFunctionBindings.get("drag")?.apply(elem, [ev, elem.data]);
  }

  public handleMouseUp(
    elem: SketcherHTMLElement,
    dragInstance: DragInstance,
    ev: MouseEvent
  ): void {
    if (!dragInstance.moveFunctionBinding || !dragInstance.upFunctionBinding) {
      return;
    }
    document.removeEventListener("mousemove", dragInstance.moveFunctionBinding);
    document.removeEventListener("mouseup", dragInstance.upFunctionBinding);
    dragInstance.moveFunctionBinding = undefined;
    dragInstance.upFunctionBinding = undefined;

    // call user defined function
    this.outsideFunctionBindings.get("end")?.apply(elem, [ev, elem.data]);
  }
}
