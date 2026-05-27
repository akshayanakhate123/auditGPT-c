import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function scoreColor(score: number): string {
  if (score < 40) return "#EF4444";
  if (score < 70) return "#F59E0B";
  return "#10B981";
}

export function scoreLabel(score: number): string {
  if (score < 40) return "Critical";
  if (score < 55) return "Weak";
  if (score < 70) return "Average";
  if (score < 85) return "Good";
  return "Excellent";
}

export function scoreBadgeClass(score: number): string {
  if (score < 40) return "bg-red-100 text-red-700";
  if (score < 70) return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}
