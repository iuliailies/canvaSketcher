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
  // keeping an instance of the mouse move function binding, because we only want to bind this mouse event to the
  // element between a mouse down and a mouse up
  moveFunctionBinding?: (this: Document, ev: MouseEvent) => void;
}

export type DragState = "start" | "drag" | "end";
export type MouseState = "mousedown" | "mousemove" | "mouseup";

export class DragEnvironment {
  outsideFunctionBindings = new Map<
    DragState,
    (this: SketcherHTMLElement, eventObj: Event, data: any) => any
  >();
  constructor(public selection?: Selection) {}

  public apply(options?: DragOptions): DragEnvironment {
    this.selection?.elements.forEach((elems) => {
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
        let downFunctionBinding = handleMouseDown.bind(
          elem,
          dragInstance,
          options || {}
        );
        let upFunctionBinding = handleMouseUp.bind(document, dragInstance);
        elem.addEventListener("mousedown", downFunctionBinding);
        document.addEventListener("mouseup", upFunctionBinding);
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
}

function handleMouseDown(
  this: SketcherHTMLElement,
  dragInstance: DragInstance,
  options: DragOptions,
  ev: MouseEvent
): void {
  dragInstance.mouseStartPosition = {
    x: +ev.x,
    y: +ev.y,
  };

  dragInstance.elementStartPosition = {
    x: parseInt(this.style.left, 10) || 0,
    y: parseInt(this.style.top, 10) || 0,
  };

  let moveFunctionBinding = handleMouseMove.bind(
    document,
    this,
    dragInstance.mouseStartPosition,
    dragInstance.elementStartPosition,
    options
  );
  dragInstance.moveFunctionBinding = moveFunctionBinding;

  document.addEventListener("mousemove", moveFunctionBinding);
}

function handleMouseMove(
  this: Document,
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
}

function handleMouseUp(this: Document, dragInstance: DragInstance): void {
  if (!dragInstance.moveFunctionBinding) {
    return;
  }
  document.removeEventListener("mousemove", dragInstance.moveFunctionBinding);
  dragInstance.moveFunctionBinding = undefined;
}
