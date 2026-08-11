/* ============================================================
 * MLS Design System -- generated file. Do not edit.
 * Source: tokens/tokens.json + data/clubs.json
 * Rebuild: npm run build
 * ============================================================ */

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
            "bg": "var(--mls-color-bg)",
            "bg-subtle": "var(--mls-color-bg-subtle)",
            "bg-muted": "var(--mls-color-bg-muted)",
            "bg-inverse": "var(--mls-color-bg-inverse)",
            "surface": "var(--mls-color-surface)",
            "surface-raised": "var(--mls-color-surface-raised)",
            "surface-sunken": "var(--mls-color-surface-sunken)",
            "fg": "var(--mls-color-fg)",
            "fg-muted": "var(--mls-color-fg-muted)",
            "fg-subtle": "var(--mls-color-fg-subtle)",
            "fg-inverse": "var(--mls-color-fg-inverse)",
            "fg-on-accent": "var(--mls-color-fg-on-accent)",
            "border": "var(--mls-color-border)",
            "border-strong": "var(--mls-color-border-strong)",
            "border-accent": "var(--mls-color-border-accent)",
            "focus": "var(--mls-color-focus)",
            "success": "var(--mls-color-success)",
            "success-bg": "var(--mls-color-success-bg)",
            "warning": "var(--mls-color-warning)",
            "warning-bg": "var(--mls-color-warning-bg)",
            "danger": "var(--mls-color-danger)",
            "danger-bg": "var(--mls-color-danger-bg)",
            "info": "var(--mls-color-info)",
            "info-bg": "var(--mls-color-info-bg)",
            "live": "var(--mls-color-live)",
            "accent": {
                  "DEFAULT": "var(--mls-color-accent-base)",
                  "contrast": "var(--mls-color-accent-contrast)",
                  "muted": "var(--mls-color-accent-muted)",
                  "emphasis": "var(--mls-color-accent-emphasis)"
            },
            "club": {
                  "primary": "var(--mls-club-primary)",
                  "secondary": "var(--mls-club-secondary)",
                  "tertiary": "var(--mls-club-tertiary)"
            },
            "neutral": {
                  "0": "var(--mls-color-primitive-neutral-0)",
                  "25": "var(--mls-color-primitive-neutral-25)",
                  "50": "var(--mls-color-primitive-neutral-50)",
                  "100": "var(--mls-color-primitive-neutral-100)",
                  "200": "var(--mls-color-primitive-neutral-200)",
                  "300": "var(--mls-color-primitive-neutral-300)",
                  "400": "var(--mls-color-primitive-neutral-400)",
                  "500": "var(--mls-color-primitive-neutral-500)",
                  "600": "var(--mls-color-primitive-neutral-600)",
                  "700": "var(--mls-color-primitive-neutral-700)",
                  "800": "var(--mls-color-primitive-neutral-800)",
                  "900": "var(--mls-color-primitive-neutral-900)",
                  "950": "var(--mls-color-primitive-neutral-950)",
                  "1000": "var(--mls-color-primitive-neutral-1000)"
            },
            "red": {
                  "0": "var(--mls-color-primitive-red-0)",
                  "25": "var(--mls-color-primitive-red-25)",
                  "50": "var(--mls-color-primitive-red-50)",
                  "100": "var(--mls-color-primitive-red-100)",
                  "200": "var(--mls-color-primitive-red-200)",
                  "300": "var(--mls-color-primitive-red-300)",
                  "400": "var(--mls-color-primitive-red-400)",
                  "500": "var(--mls-color-primitive-red-500)",
                  "600": "var(--mls-color-primitive-red-600)",
                  "700": "var(--mls-color-primitive-red-700)",
                  "800": "var(--mls-color-primitive-red-800)",
                  "900": "var(--mls-color-primitive-red-900)",
                  "950": "var(--mls-color-primitive-red-950)",
                  "1000": "var(--mls-color-primitive-red-1000)"
            },
            "navy": {
                  "0": "var(--mls-color-primitive-navy-0)",
                  "25": "var(--mls-color-primitive-navy-25)",
                  "50": "var(--mls-color-primitive-navy-50)",
                  "100": "var(--mls-color-primitive-navy-100)",
                  "200": "var(--mls-color-primitive-navy-200)",
                  "300": "var(--mls-color-primitive-navy-300)",
                  "400": "var(--mls-color-primitive-navy-400)",
                  "500": "var(--mls-color-primitive-navy-500)",
                  "600": "var(--mls-color-primitive-navy-600)",
                  "700": "var(--mls-color-primitive-navy-700)",
                  "800": "var(--mls-color-primitive-navy-800)",
                  "900": "var(--mls-color-primitive-navy-900)",
                  "950": "var(--mls-color-primitive-navy-950)",
                  "1000": "var(--mls-color-primitive-navy-1000)"
            },
            "green": {
                  "0": "var(--mls-color-primitive-green-0)",
                  "25": "var(--mls-color-primitive-green-25)",
                  "50": "var(--mls-color-primitive-green-50)",
                  "100": "var(--mls-color-primitive-green-100)",
                  "200": "var(--mls-color-primitive-green-200)",
                  "300": "var(--mls-color-primitive-green-300)",
                  "400": "var(--mls-color-primitive-green-400)",
                  "500": "var(--mls-color-primitive-green-500)",
                  "600": "var(--mls-color-primitive-green-600)",
                  "700": "var(--mls-color-primitive-green-700)",
                  "800": "var(--mls-color-primitive-green-800)",
                  "900": "var(--mls-color-primitive-green-900)",
                  "950": "var(--mls-color-primitive-green-950)",
                  "1000": "var(--mls-color-primitive-green-1000)"
            },
            "amber": {
                  "0": "var(--mls-color-primitive-amber-0)",
                  "25": "var(--mls-color-primitive-amber-25)",
                  "50": "var(--mls-color-primitive-amber-50)",
                  "100": "var(--mls-color-primitive-amber-100)",
                  "200": "var(--mls-color-primitive-amber-200)",
                  "300": "var(--mls-color-primitive-amber-300)",
                  "400": "var(--mls-color-primitive-amber-400)",
                  "500": "var(--mls-color-primitive-amber-500)",
                  "600": "var(--mls-color-primitive-amber-600)",
                  "700": "var(--mls-color-primitive-amber-700)",
                  "800": "var(--mls-color-primitive-amber-800)",
                  "900": "var(--mls-color-primitive-amber-900)",
                  "950": "var(--mls-color-primitive-amber-950)",
                  "1000": "var(--mls-color-primitive-amber-1000)"
            },
            "cyan": {
                  "0": "var(--mls-color-primitive-cyan-0)",
                  "25": "var(--mls-color-primitive-cyan-25)",
                  "50": "var(--mls-color-primitive-cyan-50)",
                  "100": "var(--mls-color-primitive-cyan-100)",
                  "200": "var(--mls-color-primitive-cyan-200)",
                  "300": "var(--mls-color-primitive-cyan-300)",
                  "400": "var(--mls-color-primitive-cyan-400)",
                  "500": "var(--mls-color-primitive-cyan-500)",
                  "600": "var(--mls-color-primitive-cyan-600)",
                  "700": "var(--mls-color-primitive-cyan-700)",
                  "800": "var(--mls-color-primitive-cyan-800)",
                  "900": "var(--mls-color-primitive-cyan-900)",
                  "950": "var(--mls-color-primitive-cyan-950)",
                  "1000": "var(--mls-color-primitive-cyan-1000)"
            }
      },
      fontFamily: {
            "display": "var(--mls-font-display)",
            "text": "var(--mls-font-text)",
            "micro": "var(--mls-font-micro)",
            "numeric": "var(--mls-font-numeric)",
            "mono": "var(--mls-font-mono)"
      },
      fontSize: {
            "3xs": "var(--mls-fontSize-3xs)",
            "2xs": "var(--mls-fontSize-2xs)",
            "xs": "var(--mls-fontSize-xs)",
            "sm": "var(--mls-fontSize-sm)",
            "base": "var(--mls-fontSize-base)",
            "lg": "var(--mls-fontSize-lg)",
            "xl": "var(--mls-fontSize-xl)",
            "2xl": "var(--mls-fontSize-2xl)",
            "3xl": "var(--mls-fontSize-3xl)",
            "4xl": "var(--mls-fontSize-4xl)",
            "5xl": "var(--mls-fontSize-5xl)",
            "6xl": "var(--mls-fontSize-6xl)",
            "7xl": "var(--mls-fontSize-7xl)",
            "8xl": "var(--mls-fontSize-8xl)",
            "9xl": "var(--mls-fontSize-9xl)"
      },
      fontWeight: {
            "light": "var(--mls-fontWeight-light)",
            "regular": "var(--mls-fontWeight-regular)",
            "medium": "var(--mls-fontWeight-medium)",
            "semibold": "var(--mls-fontWeight-semibold)",
            "bold": "var(--mls-fontWeight-bold)",
            "extrabold": "var(--mls-fontWeight-extrabold)"
      },
      lineHeight: {
            "none": "var(--mls-lineHeight-none)",
            "tight": "var(--mls-lineHeight-tight)",
            "snug": "var(--mls-lineHeight-snug)",
            "normal": "var(--mls-lineHeight-normal)",
            "relaxed": "var(--mls-lineHeight-relaxed)"
      },
      letterSpacing: {
            "tighter": "var(--mls-letterSpacing-tighter)",
            "tight": "var(--mls-letterSpacing-tight)",
            "normal": "var(--mls-letterSpacing-normal)",
            "wide": "var(--mls-letterSpacing-wide)",
            "wider": "var(--mls-letterSpacing-wider)",
            "widest": "var(--mls-letterSpacing-widest)"
      },
      spacing: {
            "0": "var(--mls-space-0)",
            "1": "var(--mls-space-1)",
            "2": "var(--mls-space-2)",
            "3": "var(--mls-space-3)",
            "4": "var(--mls-space-4)",
            "5": "var(--mls-space-5)",
            "6": "var(--mls-space-6)",
            "8": "var(--mls-space-8)",
            "10": "var(--mls-space-10)",
            "12": "var(--mls-space-12)",
            "16": "var(--mls-space-16)",
            "20": "var(--mls-space-20)",
            "24": "var(--mls-space-24)",
            "32": "var(--mls-space-32)",
            "40": "var(--mls-space-40)",
            "48": "var(--mls-space-48)",
            "64": "var(--mls-space-64)",
            "px": "var(--mls-space-px)"
      },
      borderRadius: {
            "none": "var(--mls-radius-none)",
            "xs": "var(--mls-radius-xs)",
            "sm": "var(--mls-radius-sm)",
            "md": "var(--mls-radius-md)",
            "lg": "var(--mls-radius-lg)",
            "xl": "var(--mls-radius-xl)",
            "full": "var(--mls-radius-full)",
            "notch": "var(--mls-radius-notch)"
      },
      borderWidth: {
            "0": "var(--mls-borderWidth-0)",
            "1": "var(--mls-borderWidth-1)",
            "2": "var(--mls-borderWidth-2)",
            "3": "var(--mls-borderWidth-3)",
            "4": "var(--mls-borderWidth-4)"
      },
      boxShadow: {
            "none": "var(--mls-shadow-none)",
            "xs": "var(--mls-shadow-xs)",
            "sm": "var(--mls-shadow-sm)",
            "md": "var(--mls-shadow-md)",
            "lg": "var(--mls-shadow-lg)",
            "focus": "var(--mls-shadow-focus)"
      },
      transitionDuration: {
            "instant": "var(--mls-duration-instant)",
            "fast": "var(--mls-duration-fast)",
            "base": "var(--mls-duration-base)",
            "slow": "var(--mls-duration-slow)",
            "slower": "var(--mls-duration-slower)"
      },
      transitionTimingFunction: {
            "linear": "var(--mls-easing-linear)",
            "standard": "var(--mls-easing-standard)",
            "enter": "var(--mls-easing-enter)",
            "exit": "var(--mls-easing-exit)",
            "drive": "var(--mls-easing-drive)"
      },
      zIndex: {
            "base": "var(--mls-zIndex-base)",
            "raised": "var(--mls-zIndex-raised)",
            "sticky": "var(--mls-zIndex-sticky)",
            "overlay": "var(--mls-zIndex-overlay)",
            "modal": "var(--mls-zIndex-modal)",
            "popover": "var(--mls-zIndex-popover)",
            "toast": "var(--mls-zIndex-toast)"
      },
      screens: {
            "sm": "640px",
            "md": "768px",
            "lg": "1024px",
            "xl": "1280px",
            "2xl": "1536px"
      },
    },
  },
};
