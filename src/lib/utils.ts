import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function smoothScrollTo(element: HTMLElement | null, offset = 0) {
  if (!element) return;
  const headerOffset = offset || 80;
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.scrollY - headerOffset;
  window.scrollTo({ top: offsetPosition, behavior: "smooth" });
}
