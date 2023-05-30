import { SketcherHTMLElement } from "../models/sketcher-html-element";
import { getElement2DTransform } from "../zoom/helpers";

export type PanState = "start" | "drag" | "end";

export class PanEnvironment {
  outsideFunctionBindings = new Map<
    PanState,
    (this: SketcherHTMLElement, eventObj: Event) => any
  >();

  functionBindings = {
    down: this.handleMouseDown.bind(this),
    move: this.handleMouseMove.bind(this),
    up: this.handleMouseUp.bind(this),
  };
  zoomableStartCoords = { x: 0, y: 0, zoom: 0, mouseX: 0, mouseY: 0 };

  disabled = false;

  constructor(
    private zoomableContainer: HTMLElement,
    private zoomable: HTMLElement
  ) {}

  apply(): PanEnvironment {
    this.zoomableContainer.addEventListener(
      "mousedown",
      this.functionBindings.down
    );
    return this;
  }

  public on(
    state: PanState,
    action: (this: SketcherHTMLElement, eventObj: Event) => any
  ): PanEnvironment {
    this.outsideFunctionBindings.set(state, action);
    return this;
  }

  handleMouseDown(event: any): void {
    if (this.disabled) {
      return;
    }

    this.zoomable.style.removeProperty("transition");

    this.zoomableStartCoords.mouseX = event.clientX;
    this.zoomableStartCoords.mouseY = event.clientY;

    const initialTransformValues = getElement2DTransform(this.zoomable);
    this.zoomableStartCoords.x = initialTransformValues.x;
    this.zoomableStartCoords.y = initialTransformValues.y;
    this.zoomableStartCoords.zoom = initialTransformValues.zoom;

    this.zoomableContainer.addEventListener(
      "mousemove",
      this.functionBindings.move
    );
    this.zoomableContainer.addEventListener(
      "mouseup",
      this.functionBindings.up
    );
    this.zoomableContainer.addEventListener(
      "mouseleave",
      this.functionBindings.up
    );

    this.outsideFunctionBindings.get("start")?.apply(this.zoomable, [event]);
  }

  handleMouseUp(event: any): void {
    this.zoomableContainer.removeEventListener(
      "mousemove",
      this.functionBindings.move
    );
    this.zoomableContainer.removeEventListener(
      "mouseup",
      this.functionBindings.up
    );
    this.zoomableContainer.removeEventListener(
      "mouseleave",
      this.functionBindings.up
    );

    this.outsideFunctionBindings.get("end")?.apply(this.zoomable, [event]);
  }

  handleMouseMove(event: any): void {
    // How far the mouse has been moved
    const dx = event.clientX - this.zoomableStartCoords.mouseX;
    const dy = event.clientY - this.zoomableStartCoords.mouseY;

    this.transformCanvas(
      this.zoomableStartCoords.x + dx,
      this.zoomableStartCoords.y + dy,
      this.zoomableStartCoords.zoom
    );

    // disable unwanted background selection caused by mouse movement
    document.getSelection()?.removeAllRanges();

    this.outsideFunctionBindings.get("drag")?.apply(this.zoomable, [event]);
  }

  private transformCanvas(left: number, top: number, zoom: number): void {
    this.zoomable.style.transform = `translateX(${left}px) translateY(${top}px) scale(${zoom}) `;
  }
}
