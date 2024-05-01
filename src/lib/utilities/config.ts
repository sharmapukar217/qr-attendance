export const siteConfig = {
  title: "EventManager",
  description: "",
  keywords: [],
} as const;

type TabLink = { name: string; href: string; disabled: boolean };
export const tabLinks: Array<TabLink> = [
  { name: "events", href: "/", disabled: false },
  { name: "attendance", href: "/attendance", disabled: false },
  { name: "settings", href: "/settings", disabled: true },
];

export function formatDate(
  date: Date,
  opts?: Intl.DateTimeFormatOptions,
): string {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...opts,
  });
}
