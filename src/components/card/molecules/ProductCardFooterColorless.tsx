// src/components/ProductCardFooterColorless.tsx
"use client";


import { Button } from "@/components/ui/atoms/Button";
import type { Stock } from "@/types/stock.types";
import { useEffect } from "react";

type ProductCardFooterColorlessProps = {
  items: Stock["items"];
  handleAddToCart: () => void;
  buttonText: string;
  setSelectedColor: (color: string) => void;
  t(key: string): string;
};

export default function ProductCardFooterColorless({
  items,
  handleAddToCart,
  buttonText,
  setSelectedColor,
  t,
}: ProductCardFooterColorlessProps) {

  useEffect(() => {
    setSelectedColor("#000000");
  }, [setSelectedColor]);

  return (
    <div className="flex items-center justify-between mt-10">
      <Button
        onClick={handleAddToCart}
        className="duration-300 text-xs w-full"
      >
        {items.length > 0 ? buttonText : t("outOfStock")}
      </Button>
    </div>
  );
}
