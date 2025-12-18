import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns a mail link that works best for the user's device.
 * On desktop, it opens Gmail in a browser tab.
 * On mobile, it uses the standard mailto: protocol.
 */
export function getMailLink(email: string): string {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  if (isMobile) {
    return `mailto:${email}`;
  }

  // Gmail web compose link
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`;
}
