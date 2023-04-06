import { SketcherHTMLElement } from "../models/sketcher-html-element";

export type ShowcaseState =
  | "AnimationOpenStart"
  | "AnimationOpenEnd"
  | "AnimationCloseStart"
  | "AnimationCloseEnd";

export class Showcased {
  functionBindings = new Map<ShowcaseState, (element: Showcased) => any>();
  constructor(public element: SketcherHTMLElement) {}

  public on(state: ShowcaseState, action: (this: Showcased) => any): Showcased {
    this.functionBindings.set(state, action);
    return this;
  }
}
