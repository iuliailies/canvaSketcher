import { Selection } from "./selection";
import { SketcherHTMLElement } from "../models/sketcher-html-element";

export function select(selector: string, parentNode?: HTMLElement): Selection {
  const element = parentNode
    ? parentNode.querySelector(selector)
    : document.querySelector(selector);
  if (!element) {
    return new Selection();
  }
  const selection = new Selection(
    [[element as SketcherHTMLElement]],
    parentNode ? [parentNode] : [document.documentElement]
  );
  return selection;
}

export function selectAll(
  selector: string,
  parentNode?: HTMLElement
): Selection {
  const elements = parentNode
    ? [...parentNode.querySelectorAll(selector)]
    : [...document.querySelectorAll(selector)];

  if (!elements.length) {
    return new Selection();
  }
  const selection = new Selection(
    [elements as SketcherHTMLElement[]],
    parentNode ? [parentNode] : [document.documentElement]
  );
  return selection;
}
