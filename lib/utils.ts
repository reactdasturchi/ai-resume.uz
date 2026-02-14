import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getApiUrl(path: string): string {
  const base = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  return `${base}/api${path}`;
}
