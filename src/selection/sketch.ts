import { SketcherHTMLElement } from "../models/sketcher-html-element";
import { Selection } from "./selection";

export function sketch(
  tagName: string,
  dataSet: any[],
  parentNode: HTMLElement
): Selection {
  let newElements: SketcherHTMLElement[] = [];
  dataSet.forEach((data) => {
    let newElem = document.createElement(tagName) as SketcherHTMLElement;
    newElem.data = data;
    parentNode.append(newElem);
    newElements.push(newElem);
  });
  const selection = new Selection([newElements], [parentNode]);
  return selection;
}
