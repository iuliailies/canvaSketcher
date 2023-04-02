import { SketcherHTMLElement } from "../models/sketcher-html-element";

export function contextListener(
  listener: (this: SketcherHTMLElement, event: Event, data: any) => any
) {
  return function (this: SketcherHTMLElement, event: Event) {
    listener.call(this, event, (this as SketcherHTMLElement).data);
  };
}
