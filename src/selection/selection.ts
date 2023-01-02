import { select, selectAll } from "./select";
import { SketcherHTMLElement } from "../models/sketcher-html-element";

export class Selection {
  constructor(
    public elements: SketcherHTMLElement[][] = [],
    public parentElements: HTMLElement[] = []
  ) {}

  public select(selector: string): Selection {
    let resultSelection = new Selection();
    this.elements.map((innerArray) =>
      innerArray.map((elem) => {
        resultSelection.parentElements.push(elem);
        resultSelection.elements.push(select(selector, elem).elements[0] || []);
      })
    );
    return resultSelection;
  }

  public selectAll(selector: string): Selection {
    let resultSelection = new Selection();
    this.elements.map((innerArray) =>
      innerArray.map((elem) => {
        resultSelection.parentElements.push(elem);
        resultSelection.elements.push(
          selectAll(selector, elem).elements[0] || []
        );
      })
    );
    return resultSelection;
  }

  public style(name: string, value: string | Function): Selection {
    let pointer = 0;
    this.elements.forEach((nestedElements) => {
      nestedElements.forEach((elem) => {
        const style =
          (elem.getAttribute("style") !== null
            ? elem.getAttribute("style")
            : "") +
          name +
          ": " +
          (typeof value === "string"
            ? (value as string)
            : (value as Function)(elem.data, pointer)) +
          ";";
        (elem as HTMLElement).setAttribute("style", style);
        pointer += 1;
      });
    });
    return this;
  }

  public attribute(name: string, value: string | Function): Selection {
    let pointer = 0;
    this.elements.forEach((nestedElements) => {
      nestedElements.forEach((elem) => {
        const attr =
          typeof value === "string"
            ? (value as string)
            : (value as Function)(elem.data, pointer);
        (elem as HTMLElement).setAttribute(name, attr);
        pointer += 1;
      });
    });
    return this;
  }
}
