import { select, selectAll } from "./select";
import { SketcherHTMLElement } from "../models/sketcher-html-element";
import { contextListener, EventTypes } from "./helpers";

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

  public append(selector: string): Selection {
    let resultSelection = new Selection();
    this.elements.map((innerArray) =>
      innerArray.map((elem) => {
        resultSelection.parentElements.push(elem);
        const child = elem.appendChild(document.createElement(selector));
        resultSelection.elements.push([child]);
      })
    );
    return resultSelection;
  }

  public text(
    value: string | ((this: SketcherHTMLElement, data: any, i: number) => any)
  ): Selection {
    let pointer = 0;
    this.elements.map((innerArray) =>
      innerArray.map((elem) => {
        elem.textContent =
          typeof value === "string"
            ? (value as string)
            : (
                value as (
                  this: SketcherHTMLElement,
                  data: any,
                  i: number
                ) => any
              ).apply(elem, [elem.data, pointer]);
        pointer += 1;
      })
    );
    return this;
  }

  public style(
    name: string,
    value: string | ((this: SketcherHTMLElement, data: any, i: number) => any)
  ): Selection {
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
            : (
                value as (
                  this: SketcherHTMLElement,
                  data: any,
                  i: number
                ) => any
              ).apply(elem, [elem.data, pointer])) +
          ";";

        (elem as HTMLElement).setAttribute("style", style);
        pointer += 1;
      });
    });
    return this;
  }

  public attribute(
    name: string,
    value: string | ((this: SketcherHTMLElement, data: any, i: number) => any)
  ): Selection {
    let pointer = 0;
    this.elements.forEach((nestedElements) => {
      nestedElements.forEach((elem) => {
        const attr =
          typeof value === "string"
            ? (value as string)
            : (
                value as (
                  this: SketcherHTMLElement,
                  data: any,
                  i: number
                ) => any
              ).apply(elem, [elem.data, pointer]);
        (elem as HTMLElement).setAttribute(name, attr);
        pointer += 1;
      });
    });
    return this;
  }

  public on(
    eventType: EventTypes,
    action: (this: SketcherHTMLElement, eventObj: Event, data: any) => any
  ): Selection {
    this.elements.forEach((nestedElements) => {
      nestedElements.forEach((elem) => {
        const listener = contextListener.apply(elem, [action]);
        elem.removeEventListener(eventType, listener);
        elem.addEventListener(eventType, listener);
      });
    });
    return this;
  }
}
