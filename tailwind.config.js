import { addDynamicIconSelectors } from "@iconify/tailwind";

const COLORS = [
  "background",
  "foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "success",
  "success-foreground",
  "border",
  "input",
];

/** @param key {String} */
function withOpacity(key) {
  /** @param obj { {opacityValue: string} } */
  return function ({ opacityValue }) {
    const opacity = Number(opacityValue);
    if (isNaN(opacity) || opacity === 1) return `var(--${key})`;
    return `color-mix(in srgb, var(--${key}) ${opacity * 100}%, transparent)`;
  };
}

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
    },
    extend: {
      aria: {
        invalid: 'invalid="true"',
      },

      colors: () => ({
        transparent: "transparent",
        ...COLORS.reduce((obj, key) => {
          obj[key] = withOpacity(`color-${key}`);
          return obj;
        }, {}),
      }),
      borderRadius: {
        full: "100%",
        xl: `calc(var(--border-radius) + 4px)`,
        lg: `var(--border-radius)`,
        md: `calc(var(--border-radius) - 2px)`,
        sm: "calc(var(--border-radius) - 4px)",
      },
    },
  },
  plugins: [addDynamicIconSelectors({ scale: 0 })],
};
