# CanvaSketcher

CanvaSketcher is a Typescript library used for visualizing data in an interactive and responsive way. By the means of DOM manipulation, any object from an array can be associated to an HTML element, injected into a web page and customized. The newly injected elements can be interacted with via mouse events, allowing functionalities such as dragging and zooming.

Besides the well known zoom behaviour that is dependent on the mouse wheel, CanvaSketcher treats zoom in a way that can be associated to what users know as PowerPoint presentation style. An element can be "popped-out" by enhancing it towards the center of the screen, or "spotlighted" by zooming the wrapper HTML node until the element gets centered and in focus.

`!` This package is WIP and stands as the basis of my Bachelor Thesis.
# Installing

Soon to be published on NPM. See [npm documentation](https://docs.npmjs.com/) on how to get started with npm.

# API Reference

- [x] DOM Selection
  - [x] select & selectAll
  - [x] Class methods
- [x] DOM Insertion & Data Binding
  - [x] SketcherHTMLElement
  - [x] sketch
- [x] Function Values & Parameter Accesibility
- [x] Dragging
- [ ] Zooming
  - [x] Pop-up Zoom
  - [ ] Standard Zoom
  - [ ] Spotlight Zoom
- [ ] Force simulation

## DOM Selection

The underlying element of CanvaSketcher is a `Selection`: an object keeping information of multiple DOM elements, together with the parent from which they have been selected. Behind the scenes, a Selection acts as a `querySelector` from JavaScript. However, it enhances the development experience by allowing method chaining.

### select & selectAll

A `Selection` can be obtained using one of two package global functions: `select` and `selectAll`, with or without a parent element. When no parent element is specified, it defaults to `document`. The `Selection` object holds 2 parameters:

- the elements selected, of type `SketcherHTMLElement[][]`
- the parents of those elements `HTMLElement[]`

The reason behind storing elements inside a 2-depth list is that selection calls act in a recursive manner, i.e. we can have a `select` performed on a `Selection A`. In this case, a new `Selection B` will be formed, by performing `select` on each element of `Selection A`. Elements from `A` will now become parents.

### Class methods

A `Selection` allows perfoming multiple core functions on each element of it, without needing to write down an iteration by hand. All those functions returning a `Selection` and therefore creating the flow of method chaining.

In the example below, we add to all elements of class "parent" a div of class "child". To each new element of our Selection, we add a certain text and height.
```
import * as canvaSketcher from '@iuliailies/graph-visualization-1.0.0.tgz';

canvaSketcher.selectAll(".parent")
    .append("div")
    .attribute("class", "child")
    .style("height", "10px")
    .text("Our first DOM selection").
```

## DOM Insertion & Data Binding

One feature which differentiates CanvaSketcher from vanilla JS is DOM Insertion. Having an array of data, each element can be associated to a new DOM Node and "sketched" (i.e. inserted) into the DOM. This feature turns CanvaSketcher into a data visualizaiton package.

### SketcherHTMLElement

We have defined `SketcherHTMLElement` as an interface that extends `HTMLElement` with a "data" field. Throughout a method chain, "data" will always be accessible for usage, as we will see in a following section.

### sketch

Given an array of data, an HTMLL tag and a parent node, it inserts into the DOM a node for each data element, as a child of the parent node. The method then returns a new formed `Selection`.

```
canvaSketcher.sketch('div', ['first', 'second'], document);
```

## Function Values & Parameter Accesibility

Most `Selection` methods take a `value` parameter. In our example above, "child", "10px" and "Our first DOM selection" are all considered values.

Besides strings, CanvaSketcher allows passing functions as method values. Furthermore, these functions accept some predefined parameters, chosen to improve the development flow. This leads us to two different use cases:

- Named function

Inside a named function, the `this` keyword will be referenced as the current `SketcherHTMLElement`. The following two parameters stand for the data associated to the element, and for the index in the flattened Seleciton element list.

Usage example:

```
const colors = ['red', 'blue'];

canvaSketcher.sketch('div', ['first', 'second'], document)
    .style('background-color', funciton(data: string, i: number) {
        // here, "this" stands for the SketcherHTMLElement
        if(this.classList.contains("keep-red")) return 'red;
        return colors[i];
    })

```
- Inline function

An inline function differs from a named one by the use of `this`. In this case, the keyword is not overwritten. The difference in behaviour can be used in the benefit of the developer, especially when using the package inside a Class, where `this` stands for the class itself.

To extend the example above with inline usage:

```
class AppComponent {
    colors = ['red', 'blue'];

    constructor() {
        canvaSketcher.sketch('div', ['first', 'second'], document)
            .style('background-color', function(data: string, i: number) {
                // this now stands for the Class object
                return colors[i];
            })
    }

}
```
Parameter accesibility also comes useful when dealing with mouse event handlers, allowing access both to the data, but also to the event object.

## Dragging

The drag feature in CanvaSketcher is as easy as calling `.draggable()` on a Selection. As expected, it works together with absolute positioned elements. The mouse event logic is handled behind the scenes.

```
canvaSketcher.selectAll(".graph-nodes").draggable();
```

If the developer wants to extend the default functionality, CanvaSketcher offers a `DragEnvironment` class, which can be creating by calling the `drag()` global metod. A `DragEnvironment` comes with extra handlers for `start`, `drag` and `end`, making the behaviour easily customizable. If a DragEnvironment is created, it also needs to be started, by calling the method `.apply()` and passing a Selection as parameter.

Example of applying shadow during the drag event for all DOM nodes of class "draggable":
```
const dragEnv = canvaSketcher
    .drag()
    .on('start', function (ev: Event, data: any) {
    gv.select(this).style('box-shadow', ' 0 5px 20px 0 gray');
    })
    .on('end', function (ev: Event) {
    gv.select(this).style('box-shadow');
    });

dragEnv.apply(canvaSketcher.selectAll(".dtaggable")).
```

Both the class method and the global drag function accept an `options` parameter.

```
export interface DragOptions {
    // a boundary for the dragging the element
    container?: HTMLElement;
    // zoom value of the wrapper element; 1 by default
    scale?: number;
    // delay, in pixels, until the drag behaviour is activated
    threshold?: number;
    // when true, all outer events are disabled after the threshold is reached and up until a mouseup
    // prevents the classic "click after drag" issue
    disableEvents?: boolean;
}
```

## Zooming

`!` This feature might suffer future changes, since it is WIP.

Zooming is a core feature of CanvaSketcher, because it was adapted for mutiple scenarios. Besides the classic mouse-centered zoom, CanvaSketcher offers presentation-style zooming, where a certain object is brought into focus and allows room for its content to be expanded. The feature can be accessed through the global method `.zoomIn()`.

The method takes multiple parameters, the first being a Selection to which is applied. It also has optional parameters, such as an `exitable` HTMLElement or an `exitShortcut` object. When in a presentation-style zoom mode, they allow ways of returning to default. The method also takes an option object:

```
export interface ZoomInOptions {
    // time until the zoom animaiton is initiated, in seconds
    transitionDelay?: number;
    // animaiton duration, in seconds
    transitionDuration?: number;
    // animation curve style
    transitionCurve?: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out";
    // margin around the zoomed element; in percentage, relative to the window
    boundary?: string;
}
```

The `.zoomIn()` method returns a `Zoomable` object. The purpose of this is providing a method binding posibility on different ZoomStates: "AnimationOpenStart" | "AnimationOpenEnd" | "AnimationCloseStart" | "AnimationCloseEnd". For example, at the end of a presentation-style zoom event, the developer might want to show extra content inside the element, or to alter the text font-size.

Zoom usage example:
```
canvaSketcher.selectAll('.board').on('click', function (event: Event, data: any) {
      canvaSketcher.zoomIn(
        this,
        gv.ZoomInMode.PopUp,
        {
          transitionDuration: 1,
          boundary: '10%',
        },
        document.querySelector('.exitBtn')! as HTMLElement,
      )
        .on('AnimationOpenEnd', function () {
          canvaSketcher.select('.exitBtn').style('display'); // show exit button
        })
        .on('AnimationCloseEnd', () => {
          canvaSketcher.select('.exitBtn').style('display', 'none'); // hide exit button
        });
    });

```


As seen above, the `.zoomIn()` methos also takes a zoom mode parameter:
### Pop-up Zoom
This zoom mode takes the element, translates it towards the center of the screen and increases its dimensions.

### TODO:

Standard Zoom <br/>
Spotlight Zoom <br/>
Force simulation
