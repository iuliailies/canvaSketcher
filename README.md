# CanvaSketcher

CanvaSketcher is a WIP Typescript library used for visualizing data in an interactive and responsive way. By the means of DOM manipulation, any object from an array can be associated to an HTML element, injected into a web page and customized. The newly injected elements can be interacted with via mouse events, allowing functionalities such as dragging and zooming.

Besides the well known zoom behaviour that is dependent on the mouse wheel, CanvaSketcher treats zoom in a way that can be associated to what users know as PowerPoint presentation style. An element can be "popped-out" by enhancing it towards the center of the screen, or "spotlighted" by zooming the wrapper HTML node until the element gets centered and in focus.

This package stands as the basis of my Bachelor Thesis.
# Installing

Soon to be published on NPM. See [npm documentation](https://docs.npmjs.com/) on how to get started with npm.

# API Reference

- DOM Selection
- DOM Insertion & Data Binding
- Function Values & Parameter Accesibility
- Dragging
- Pop-up Zoom
- Spotlight Zoom
- Standard Zoom

## DOM Selection

The underlying element of CanvaSketcher is a `Selection`: an object keeping information of multiple DOM elements, together with the parent from which they have been selected. Behind the scenes, a Selection acts as a `querySelector` from JavaScript. However, it enhances the development experience by allowing method chaining.

A `Selection` can be obtained using one of two package global functions: `select` and `selectAll`, with or without a parent element. When no parent element is specified, it defaults to `document`. The `Selection` object holds 2 parameters:

- the elements selected, of type `SketcherHTMLElement[][]`
- the parents of those elements `HTMLElement[]`

The reason behind storing elements inside a 2-depth list is that selection calls act in a recursive manner, i.e. we can have a `select` performed on a `Selection A`. In this case, a new `Selection B` will be formed, by performing `select` on each element of `Selection A`. Elements from `A` will now become parents.

A `Selection` allows perfoming multiple core functions on each element of it, without needing to write down an iteration by hand. All those functions returning a `Selection` and therefore creating the flow of method chaining. In the example below, we add to all elements of class "parent" a div of class "child". To each new element of our Selection, we add a certain text and height.

```
import * as canvaSketcher from '@iuliailies/graph-visualization-1.0.0.tgz';

canvaSketcher.selectAll(".parent")
    .append("div")
    .attribute("class", "child")
    .style("height", "10px")
    .text("Our first DOM selection").
```

