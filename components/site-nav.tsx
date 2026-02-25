"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/command-center", label: "Command Center" },
  { href: "/search", label: "Search" },
  { href: "/map", label: "Map" },
  { href: "/graph", label: "Graph" },
  { href: "/analytics", label: "Analytics" },
  { href: "/admin", label: "Admin" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="nav-strip" aria-label="Primary">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link ${active ? "nav-link-active" : ""}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
