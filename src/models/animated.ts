import { Point } from "../drag/drag-environment";
import { SketcherHTMLElement } from "./sketcher-html-element";

export type ShowcaseState =
  | "AnimationOpenStart"
  | "AnimationOpenEnd"
  | "AnimationCloseStart"
  | "AnimationCloseEnd";

export interface AnimatedOptions {
  // time until the animaiton is initiated, in seconds
  transitionDelay?: number;
  // animaiton duration, in seconds/100px
  transitionDuration?: number;
  // animation curve style
  transitionCurve?: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out";
}

export interface TransformValues extends Point {
  zoom: number;
}

export class Animated {
  functionBindings = new Map<ShowcaseState, (element: Animated) => any>();

  constructor(
    public element: SketcherHTMLElement,
    public prevTransformValues?: TransformValues,
    public options?: AnimatedOptions
  ) {}

  public on(state: ShowcaseState, action: (this: Animated) => any): Animated {
    this.functionBindings.set(state, action);
    return this;
  }

  public handleCallbacks(state: "open" | "close"): void {
    setTimeout(() => {
      const startAction = this.functionBindings.get(
        state === "open" ? "AnimationOpenStart" : "AnimationCloseStart"
      );
      if (startAction) {
        startAction.apply(this, [this]);
      }
      setTimeout(() => {
        const endAction = this.functionBindings.get(
          state === "open" ? "AnimationOpenEnd" : "AnimationCloseEnd"
        );
        if (endAction) {
          endAction.apply(this, [this]);
        }
      }, (this.options?.transitionDuration || 0) * 1000);
    }, (this.options?.transitionDelay || 0) * 1000);
  }
}
