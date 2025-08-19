import { IoAnalyticsOutline } from "react-icons/io5";
import { MdOutlineInventory2 } from "react-icons/md";
import { RiShoppingCart2Line } from "react-icons/ri";

const FEATURES = [
  {
    title: "Inventory Management",
    icon: MdOutlineInventory2,
    content: "See what sells best and restock with confidence in real time.",
    color: "blue",
  },
  {
    title: "Intelligent Analytics",
    icon: IoAnalyticsOutline,
    content:
      "Make data‑driven decisions with clear dashboards and exportable reports.",
    color: "rose",
  },
  {
    title: "POS Management",
    icon: RiShoppingCart2Line,
    content:
      "Handle sales, refunds, and end‑of‑day summaries from one powerful POS.",
    color: "emerald",
  },
] as const;

export default FEATURES;