import { select, selectAll } from "./select";

export class Selection {
  constructor(
    private elements: HTMLElement[][] = [],
    private parentElements: HTMLElement[] = []
  ) {}

  select(selector: string): Selection {
    let resultSelection = new Selection();
    this.elements.map((innerArray) =>
      innerArray.map((elem) => {
        resultSelection.parentElements.push(elem);
        resultSelection.elements.push(select(selector, elem).elements[0]);
      })
    );
    return resultSelection;
  }

  selectAll(selector: string): Selection {
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
