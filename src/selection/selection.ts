import { select, selectAll } from "./select";
import { SketcherHTMLElement } from "../models/sketcher-html-element";

export class Selection {
  constructor(
    private elements: SketcherHTMLElement[][] = [],
    private parentElements: HTMLElement[] = []
  ) {}

  public select(selector: string): Selection {
    let resultSelection = new Selection();
    this.elements.map((innerArray) =>
      innerArray.map((elem) => {
        resultSelection.parentElements.push(elem);
        resultSelection.elements.push(select(selector, elem).elements[0]);
      })
    );
    return resultSelection;
  }

  public selectAll(selector: string): Selection {
    let resultSelection = new Selection();
    this.elements.map((innerArray) =>
      innerArray.map((elem) => {
        resultSelection.parentElements.push(elem);
        resultSelection.elements.push(selectAll(selector, elem).elements[0]);
      })
    );
    return resultSelection;
  }
}
