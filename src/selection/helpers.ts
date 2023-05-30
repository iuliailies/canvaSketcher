import { SketcherHTMLElement } from "../models/sketcher-html-element";

export function contextListener(
  listener: (
    this: SketcherHTMLElement,
    event: Event,
    data: any,
    i: number
  ) => any,
  i: number
) {
  return function (this: SketcherHTMLElement, event: Event) {
    listener.call(this, event, (this as SketcherHTMLElement).data, i);
  };
}
