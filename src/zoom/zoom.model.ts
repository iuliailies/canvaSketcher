import { AnimatedOptions } from "../models/animated";

export type ZoomState = "zoom";

export interface TransformValue {
  left: number;
  top: number;
  zoom: number;
}

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

export interface TargetOptions extends AnimatedOptions {
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
