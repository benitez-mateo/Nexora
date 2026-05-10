"use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "./use-reduced-motion";

export { gsap, useGSAP };

export const EASE = "power3.out";
export const EASE_IN_OUT = "power2.inOut";

const stripTimingVars = (vars: gsap.TweenVars): gsap.TweenVars => {
  const { duration, ease, delay, repeat, yoyo, stagger, ...rest } = vars as Record<
    string,
    unknown
  >;
  return rest as gsap.TweenVars;
};

export function safeTo(
  target: gsap.TweenTarget,
  vars: gsap.TweenVars,
): gsap.core.Tween | void {
  if (prefersReducedMotion()) {
    gsap.set(target, stripTimingVars(vars));
    return;
  }
  return gsap.to(target, vars);
}

export function safeFromTo(
  target: gsap.TweenTarget,
  from: gsap.TweenVars,
  to: gsap.TweenVars,
): gsap.core.Tween | void {
  if (prefersReducedMotion()) {
    gsap.set(target, stripTimingVars(to));
    return;
  }
  return gsap.fromTo(target, from, to);
}
