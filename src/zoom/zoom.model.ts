export type ZoomState = "zoom";

export interface ZoomOptions {
  // how much the zoom value should be incremented/decremented inside one callback;
  step?: number;
  // maximum zoom value
  upperBound?: number;
  // minimum zoom value
  lowerBound?: number;
  // method for triggering zoom behaviour;
  method?: {
    type: "mouse" | "keyboard";
    ctrlKey?: boolean;
  };
}

export interface TargetOptions {
  // time until the animaiton is initiated, in seconds
  transitionDelay?: number;
  // animaiton duration, in seconds/100px
  transitionDuration?: number;
  // animation curve style
  transitionCurve?: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out";
  // margin around the zoomed element; in percentage, relative to zoomable container
  boundary?: number;
}

export const defaultZoomOptions: ZoomOptions = {
  step: 0.1,
  method: {
    type: "mouse",
    ctrlKey: true,
  },
};

export const defaultTargetOptions: TargetOptions = {
  transitionDuration: 0.4,
  transitionCurve: "ease-out",
  boundary: 0.05,
};
