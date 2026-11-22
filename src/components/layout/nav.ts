import type { IconName } from "@/components/icons";
import type { Dictionary } from "@/lib/i18n";

export type NavItem = { href: string; label: (d: Dictionary) => string; icon: IconName };

export const primaryNav: NavItem[] = [
  { href: "/flights", label: (d) => d.nav.flights, icon: "plane" },
  { href: "/hotels", label: (d) => d.nav.hotels, icon: "bed" },
  { href: "/flight-hotel", label: (d) => d.nav.flightHotel, icon: "suitcase" },
  { href: "/cars", label: (d) => d.nav.cars, icon: "car" },
  { href: "/transfers", label: (d) => d.nav.transfers, icon: "transfer" },
  { href: "/desert-safari", label: (d) => d.nav.safari, icon: "dunes" },
  { href: "/activities", label: (d) => d.nav.activities, icon: "ticket" },
];

export const moreNav: NavItem[] = [
  { href: "/packages", label: (d) => d.nav.packages, icon: "suitcase" },
  { href: "/visa", label: (d) => d.nav.visa, icon: "passport" },
  { href: "/africa-to-dubai", label: (d) => d.nav.africa, icon: "globe" },
  { href: "/services/corporate-travel", label: (d) => d.nav.business, icon: "briefcase" },
  { href: "/luxury-travel", label: (d) => d.nav.luxury, icon: "gem" },
  { href: "/services", label: (d) => d.nav.more, icon: "sparkles" },
];
