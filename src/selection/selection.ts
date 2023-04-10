import { select, selectAll } from "./select";
import { SketcherHTMLElement } from "../models/sketcher-html-element";
import { contextListener } from "./helpers";
import { DragEnvironment, DragOptions } from "../drag/drag-environment";
import { ZoomEnvironment } from "../zoom/zoom-environment";

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
    value?: string | ((this: SketcherHTMLElement, data: any, i: number) => any)
  ): Selection {
    let pointer = 0;
    this.elements.forEach((nestedElements) => {
      nestedElements.forEach((elem) => {
        elem.style.removeProperty(name);

        let style =
          elem.getAttribute("style") !== null ? elem.getAttribute("style") : "";

        if (value) {
          style +=
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
        }

        if (style !== null) {
          (elem as HTMLElement).setAttribute("style", style);
        }
        pointer += 1;
      });
    });
    return this;
  }

  public attribute(
    name: string,
    value?: string | ((this: SketcherHTMLElement, data: any, i: number) => any)
  ): Selection {
    let pointer = 0;
    this.elements.forEach((nestedElements) => {
      nestedElements.forEach((elem) => {
        if (!value) {
          elem.removeAttribute(name);
        } else {
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
        }

        pointer += 1;
      });
    });
    return this;
  }

  public on(
    eventType: keyof HTMLElementEventMap,
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

  public draggable(options?: DragOptions): Selection {
    let dragEnvironment = new DragEnvironment();
    dragEnvironment.apply(this, options);
    return this;
  }

  public zoomable(): Selection {
    let parent: SketcherHTMLElement;
    this.elements.forEach((elems, index) => {
      parent = this.parentElements[index];
      elems.forEach((elem) => {
        let zoomEnvironment = new ZoomEnvironment(parent, elem);
        zoomEnvironment.apply();
      });
    });
    return this;
  }

  public getFirst(): SketcherHTMLElement | undefined {
    return this.elements[0][0];
  }
}
