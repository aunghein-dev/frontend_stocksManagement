import { Button } from "@/components/ui/atoms/Button";
import type { Stock } from "@/types/stock.types";
import { memo } from "react";

type ProductCardFooterProps = {
  items: Stock["items"];
  isAddToCartDisabled: boolean;
  isColorSelected: boolean;
  clearColor: () => void;
  handleAddToCart: () => void;
  buttonText: string;
  t(key: string): string;
  colorSet: string[];
  selectedColor: string;
  setSelectedColor: (color: string) => void;
};

function ProductCardFooter({
  items,
  isAddToCartDisabled,
  isColorSelected,
  clearColor,
  handleAddToCart,
  buttonText,
  t,
  colorSet,
  selectedColor,
  setSelectedColor
}: ProductCardFooterProps) {
  return (
    <>
       <div className="flex items-center min-h-7 overflow-x-auto flex-nowrap scrollbar-hide custom-scrollbar px-1"> 
            <div className="flex gap-1">
              {colorSet.map((color, index) => (
                <button
                  key={color + "-" + index}
                  className={`w-5 h-5 rounded-full ring-2 transition duration-200 border-[0.5px] border-gray-300 ${ // Reduced swatch size w-4 h-4
                    selectedColor === color ? "ring-offset-1 ring-blue-600" : "ring-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
      </div>
      
      <div className="flex items-center justify-between">
        <button
          className={`mr-2 text-red-600 
                    hover:text-red-500 
                      text-sm 
                      transition 
                      duration-200 ${
            isColorSelected ? "opacity-100" : "opacity-0"
          }`}
          onClick={clearColor}
        >
          {t("Clear")}
        </button>
        <Button
          disabled={isAddToCartDisabled}
          size="sm"
          variant={isAddToCartDisabled ? "ghost" : "primary"}
          onClick={handleAddToCart}
          className="duration-300 text-xs"
        >
          {items.length > 0 ? buttonText : t("outOfStock")}
        </Button>
      </div>
   </>
  );
}

export default memo(ProductCardFooter);