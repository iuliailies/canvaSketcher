import { Selection } from "./selection";

export function select(selector: string, parentNode?: HTMLElement): Selection {
  const element = parentNode
    ? parentNode.querySelector(selector)
    : document.querySelector(selector);
  if (!element) {
    return new Selection();
  }
  const selection = new Selection(
    [[element as HTMLElement]],
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
    [elements as HTMLElement[]],
    parentNode ? [parentNode] : [document.documentElement]
  );
  return selection;
}
