import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string): string {
  if (!name) return "";

  return name
      .trim()
      .split(/\s+/) // split by space
      .map(part => part[0].toUpperCase())
      .join("");
}

export const requiredKey = async (keys: string[], body: Record<string, any>): Promise<boolean> => {
  return keys.every((key) => body.hasOwnProperty(key) && body[key] !== undefined && body[key] !== null)
}

export const formatIp = (xForwardedFor: string) => {
  const regex = /[^:f/]+/g
  const results = xForwardedFor.match(regex) as string[]
  return results[0]
}

export function groupByKey(array: {[key: string]: any}[], key: string) {
  return array.reduce((result, item) => {
      const group = item[key] ?? 'undefined';
      if (!result[group.toLowerCase()]) {
          result[group.toLowerCase()] = [];
      }
      result[group.toLowerCase()].push(item);
      return result;
  }, {});
}