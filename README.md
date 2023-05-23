# CanvaSketcher

CanvaSketcher is a Typescript library used for visualizing data in an interactive and responsive way. By the means of DOM manipulation, any object from an array can be associated to an HTML element, injected into a web page and customized. The newly injected elements can be interacted with via mouse events, allowing functionalities such as dragging and zooming.

Besides the well known zoom behavior that is mouse-wheel or keyboard dependent, CanvaSketcher treats zoom in a way that can be associated with what users know as PowerPoint presentation style. An element can be "popped-out" by enhancing it towards the center of the screen, or "focused" by translating and scaling its wrapper HTML node until the target element gets centered and in focus.


`!` This package forms the basis of my Bachelor Thesis.
# Installing


Install the package using the npm CLI, by running `npm i @iuliailies/canva-sketcher`. See [npm documentation](https://docs.npmjs.com/) on how to get started with npm.


# API Reference


- [x] [DOM Selection](https://github.com/iuliailies/canvaSketcher#dom-selection)
  - [x] [select & selectAll](https://github.com/iuliailies/canvaSketcher#select--selectall)
  - [x] [Class methods](https://github.com/iuliailies/canvaSketcher#class-methods)
- [x] [DOM Insertion & Data Binding](https://github.com/iuliailies/canvaSketcher#dom-insertion--data-binding)
  - [x] [SketcherHTMLElement](https://github.com/iuliailies/canvaSketcher#sketcherhtmlelement)
  - [x] [sketch](https://github.com/iuliailies/canvaSketcher#sketch)
- [x] [Function Values & Parameter Accesibility](https://github.com/iuliailies/canvaSketcher#function-values--parameter-accesibility)
- [x] [Dragging](https://github.com/iuliailies/canvaSketcher#dragging)
- [x] [Zooming](https://github.com/iuliailies/canvaSketcher#zooming)
  - [x] [Standard Zoom](https://github.com/iuliailies/canvaSketcher#standard-zoom)
  - [x] [Focused Zoom](https://github.com/iuliailies/canvaSketcher#focused-zoom)
- [x] [Panning](https://github.com/iuliailies/canvaSketcher#panning)
- [x] [PopUp](https://github.com/iuliailies/canvaSketcher#popup)


## DOM Selection


The underlying element of CanvaSketcher is a `Selection`: an object keeping information about multiple DOM elements, together with the parent from which they have been selected. Behind the scenes, a Selection acts as a `querySelector` from JavaScript. However, it enhances the development experience by allowing method chaining.


### select & selectAll


A `Selection` can be obtained using one of two package global functions: `select` and `selectAll`, with or without a parent element. When no parent element is specified, it defaults to `document`. The `Selection` object holds 2 parameters:


- the elements selected, of type `SketcherHTMLElement[][]`
- the parents of those elements `HTMLElement[]`


The reason behind storing elements inside a 2-depth list is that selection calls act in a recursive manner, i.e. we can have a `select` performed on a `Selection A`. In this case, a new `Selection B` will be formed, by performing `select` on each element of `Selection A`. Elements from `A` will now become parents.


### Class methods


A `Selection` allows performing multiple core functions on each element of it without needing to write down an iteration by hand. All those functions return a `Selection` and therefore create the flow of method chaining.


In the example below, we add to all elements of class "parent" a div of class "child". To each new element of our Selection, we add a certain text and height.
```
import * as canvaSketcher from '@iuliailies/canva-sketcher';


canvaSketcher.selectAll(".parent")
    .append("div")
    .attribute("class", "child")
    .style("height", "10px")
    .text("Our first DOM selection").
```


## DOM Insertion & Data Binding


One feature that differentiates CanvaSketcher from vanilla JS is DOM Insertion. Having an array of data, each element can be associated with a new DOM Node and "sketched" (i.e. inserted) into the DOM. This feature turns CanvaSketcher into a data visualization package.


### SketcherHTMLElement


We have defined `SketcherHTMLElement` as an interface that extends `HTMLElement` with a "data" field. Throughout a method chain, "data" will always be accessible for usage, as we will see in a following section.


### sketch


Given an array of data, an HTML tag and a parent node, it inserts into the DOM a node for each data element, as a child of the parent node. The method then returns a new formed `Selection`.


```
canvaSketcher.sketch('div', ['first', 'second'], document);
```


## Function Values & Parameter Accesibility


Most `Selection` methods take a `value` parameter. In our example above, "child", "10px" and "Our first DOM selection" are all considered values.


Besides strings, CanvaSketcher allows passing functions as method values. Furthermore, these functions accept some predefined parameters, chosen to improve the development flow. This leads us to two different use cases:


- Named function


Inside a named function, the `this` keyword will be referenced as the current `SketcherHTMLElement`. The following two parameters stand for the data associated to the element, and for the index in the flattened Selection element list.


Usage example:


```
const colors = ['red', 'blue'];


canvaSketcher.sketch('div', ['first', 'second'], document)
    .style('background-color', function(data: string, i: number) {
        // here, "this" stands for the SketcherHTMLElement
        if(this.classList.contains("keep-red")) return 'red;
        return colors[i];
    })


```
- Inline function


An inline function differs from a named one by the use of `this`. In this case, the keyword is not overwritten. The difference in behavior can be used to the benefit of the developer, especially when using the package inside a Class, where `this` stands for the class itself.


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
Parameter accessibility also comes in handy when dealing with mouse event handlers, allowing access not only to the data, but also to the event object.


## Dragging


The drag feature in CanvaSketcher is as easy as calling `.draggable()` on a Selection. As expected, it works together with absolute positioned elements. The mouse event logic is handled behind the scenes.


```
canvaSketcher.selectAll(".graph-nodes").draggable();
```


If the developer wants to extend the default functionality, CanvaSketcher offers a `DragEnvironment` class, which can be created by calling the `drag()` global method. A `DragEnvironment` comes with extra handlers for `start`, `drag` and `end`, making the behavior easily customizable. If a DragEnvironment is created, it also needs to be started, by calling the method `.apply()` and passing a Selection as a parameter.


A DragEnvironment also has a "disabled" boolean, which can easily be set to false in a context such as [focusing](https://github.com/iuliailies/canvaSketcher#focused-zoom).


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


CanvaSketcher turned zooming into a very versatile feature. Similarly to how dragging is implemented, the `zoom()` function creates a Zoom Environment. However, it requires 2 arguments: a `zoomable` and a `zoomableContainer`. The latter is considered the wrapper, inside which the zoomable is translated accordingly. Creating a Zoom Environment also accepts an optional one: `focusLimit`, which limits how many elements can be focused at once (check the [focusing](https://github.com/iuliailies/canvaSketcher#focused-zoom) section)


### Standard zoom


By calling `apply()` on a Zoom Environment, the zoom listeners are triggered. CanvaSketcher supports 2 types of standard zooming: mouse-wheel based and keyboard based, both with or without a Ctrl key. Mouse-wheel based zooming increments or decrements the zoom value accordingly, while also translating the `zoomable` based on the mouse position. Therefore, the mouse cursor remains at the same point along the whole translation. Keyboard zooming works similarly, but zooms towards the center of the `zoomableContainer`.


Specifying the zoom type is done by passing an options object to the `apply` function. Along with it you can specify the zoom step and bounds, if any.


A standard zoom behavior can be applied to a `Selection` by just calling `zoomable()` on it. A Zoom Environment will be created for each element <-> parent pair of the Selection. In this case, `apply()` will be called by default, with ctrl + mousewheel as default behaviour.


The ZoomEnvironment also accepts a `zoom` handler function, which will be called whenever the zoom value was changed. The callback function takes the `zoomable` as `this`, while also giving access to other useful parameters: the current zoom value, the event handler and, lastly, the target.


Targets are elements belonging to the Zoom Environment, which can be marked as a target by calling `targetable(selection: Selection)`. All elements in the selection will be considered targets. Whenever a zoom action is performed, the `target` parameter of the callback function will hold the target element that is currently under the mouse wheel, or "undefined" if there is no such element.


A complete example of the zoom feature:


```
    const zoomableContainer = canvaSketcher.select('wrapper').getFirst();
    const zoomable = canvaSketcher.select('zoomable').getFirst();


    const rectangless = canvaSketcher
      .sketch('div', ['hi', 'there'], rect)
      .style('width', () => '50px')
      .style('height', '50px')


    if(zoomable && zoomableContainer) {
      const zoomEnv = canvaSketcher
      .zoom(
        zoomableContainer, zoomable
      )
      .apply({
        upperBound: 1.5,
        lowerBound: 0.6,
        method: {
          type: 'mouse',
          ctrlKey: true,
        },
      })
      .on(
        'zoom',
        function (ev: Event, zoom: number, target: HTMLElement | any) {
          ev.preventDefault();
        }
      )
      .targetable(rectangles);
    }
```


or, much shorter but less customizable:


```
canvaSketcher.select('.wrapper').selectAll('.card-container').zoomable();
```


### Focused zoom


Besides the classic zoom, CanvaSketcher offers presentation-style zooming. Triggered by the `focus(target: HtmlElement)` function, the `zoomable` element is zoomed as much as possible, such that the target element is centered inside the `zoomableContainer`. Multiple elements can be focused inside a Zoom Environment, as they're being kept track of using a stack.


The `focus()` function also takes some optional parameters, such as an `exitable` HTMLElement or an `exitShortcut` object. They allow different ways of returning to the previously focused element or, when the stack is empty, to the default state. If those 2 methods are not enough, a ZoomEnvironment also offers an `unfocus()` function, which can be called independently.


The `focus()` method also takes an option object:


```
export interface ZoomInOptions {
    // time until the zoom animaiton is initiated, in seconds
    transitionDelay?: number;
    // animaiton duration, in seconds
    transitionDuration?: number;
    // animation curve style
    transitionCurve?: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out";
    // margin around the zoomed element; in percentage, relative to the zoomableContainer
    boundary?: string;
}
```


The `.focus()` method returns a `Animated` object. The purpose of this is to provide a method binding possibility on different ZoomStates: "AnimationOpenStart" | "AnimationOpenEnd" | "AnimationCloseStart" | "AnimationCloseEnd". For example, at the end of a focused zoom event, the developer might want to show extra content inside the element, or alter the text font-size.


Note than one can set a limit of how many elements can be focused consecutively by passing the optional `focusLimit` parameter when initializing the ZoomEnvironment.


## Panning
Strongly related to the concept of zooming, panning gives the possibility of dragging an element. The difference to a drag behaviour happens behind the scenes: panning resolves to a translation, while dragging happens in an absolute environment. Therefore, panning can be easily integrated with the zoom feature, by simply calling `pannable()` on a Zoom Environment. This creates a PanEnvironment and gives further access to `start`, `drag` and `end` hooks.


A PanEnvironment can also be initialized by caalin the glbal function `pan`.


A PanEnvironment also has a "disabled" boolean, which can easily be set to false in a context such as [focusing](https://github.com/iuliailies/canvaSketcher#focused-zoom).


A functional example of the pan feature:
```
    const panEnv = zoomEnv
      .pannable()
      .on('start', () => {
        zoomableContainer.classList.add('panning');
      })
      .on('end', () => {
        zoomableContainer.classList.remove('panning');
      });
```
## PopUp
Similar concept to the focused zoom, but with no need for a Zoom Environment: Pop-up zoom takes an HTML element and transforms it with translation ans scaling. The element is cenetred inside the document and enlarged, independently of the document scroll state.


The functionality is triggered by calling `popup(element: HtmlElement)` and can be configured similarly to Focused Zoom. It takes the same `option`, `exitable` and `exitableShortcut` optional parameters and it also supports method binding possibilities for the 4 zoom states: "AnimationOpenStart" | "AnimationOpenEnd" | "AnimationCloseStart" | "AnimationCloseEnd".
