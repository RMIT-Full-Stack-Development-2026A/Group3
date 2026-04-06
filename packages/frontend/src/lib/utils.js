import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn - Utility to merge Tailwind classes using clsx and tailwind-merge.
 * Essential for the Radix UI components from Figma.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
