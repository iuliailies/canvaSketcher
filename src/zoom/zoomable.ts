import { SketcherHTMLElement } from "../models/sketcher-html-element";

export type ZoomState =
  | "AnimationOpenStart"
  | "AnimationOpenEnd"
  | "AnimationCloseStart"
  | "AnimationCloseEnd";

export class Zoomable {
  functionBindings = new Map<ZoomState, (element: Zoomable) => any>();
  constructor(public element: SketcherHTMLElement) {}

  public on(state: ZoomState, action: (this: Zoomable) => any): Zoomable {
    this.functionBindings.set(state, action);
    return this;
  }
}
