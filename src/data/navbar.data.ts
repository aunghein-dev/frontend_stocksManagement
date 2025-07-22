// src/data/navbar.data.ts

export interface NavbarItem {
  id: number;
  key: string; // This will be the translation key (e.g., "home", "dashboard", "inventory")
  path?: string; // path is now optional for group headers (they don't navigate directly)
  isGroup?: boolean; // New property to indicate if it's a group header
  children?: NavbarItem[]; // New property for nested items
}

const navbarData: NavbarItem[] = [
  { id: 1, key: "home", path: "/" },
  { id: 2, key: "dashboard", path: "/dashboard" },
  {
    id: 3,
    key: "sales",
    isGroup: true,
    children: [
      { id: 31, key: "salesTransactions", path: "/sales/transaction" },
      { id: 32, key: "salesReports", path: "/sales/report" },
    ],
  },
  {
    id: 4,
    key: "inventory",
    isGroup: true,
    children: [
      { id: 41, key: "stocks", path: "/inventory/stocks" },
      { id: 42, key: "customers", path: "/inventory/customers" }, 
      //{ id: 53, key: "suppliers", path: "/inventory/suppliers" }, 
    ],
  },

  { id: 5, key: "settings", path: "/settings" },
  { id: 6, key: "privacyPolicy", path: "/privacyPolicy" }, 
];

export default navbarData;