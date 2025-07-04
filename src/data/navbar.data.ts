// src/data/navbar.data.ts
import { IconType } from "react-icons"; // Import IconType if you plan to extend this with icons directly

export interface NavbarItem {
  id: number;
  key: string; // This will be the translation key (e.g., "home", "dashboard")
  path: string;
  // You might optionally add: iconKey?: string; if your icon keys differ from translation keys
}

const navbarData: NavbarItem[] = [
  { id: 1, key: "home", path: "/" },
  { id: 2, key: "dashboard", path: "/dashboard" },
  { id: 3, key: "sales", path: "/sales" },
  { id: 4, key: "stocks", path: "/stocks" },
  { id: 5, key: "report", path: "/report" },
  { id: 6, key: "settings", path: "/settings" },
  { id: 7, key: "privacyPolicy", path: "/privaypolicy" }, // Corrected key to match common convention
];

export default navbarData;