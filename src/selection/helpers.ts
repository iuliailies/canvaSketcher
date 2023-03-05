import { SketcherHTMLElement } from "../models/sketcher-html-element";

export type EventTypes ="click" | "mousedown" | "mouseover" |"mouseup" | "dblckick" | "resize";

export function contextListener(
  listener: (this: SketcherHTMLElement, eventObj: Event, data: any) => any
) {
  return function (this: SketcherHTMLElement, event: Event) {
    listener.call(this, event, (this as SketcherHTMLElement).data);
  };
}
