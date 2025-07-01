"use client";

import { useState, useEffect, useMemo } from "react";
import Product from "@/components/data-display/card";
import PaginationComponent from "@/components/data-display/atoms/pagination";
import Search from "@/components/form/search";
import Image from "next/image";
import { useModalStore } from "@/store/modalStore";
import { useStocks } from "@/hooks/useStocks";
import type { Stock } from "@/data/table.data";

const ITEMS_PER_PAGE = 24;

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { items, isLoading, error } = useStocks();
  const { openModal, closeModal } = useModalStore();

  // Show modal loading when fetching
  useEffect(() => {
    if (isLoading) {
      openModal("loading");
    } else {
      closeModal();
    }
  }, [isLoading]);

  // Filter stocks using search query
  const filteredStocks = useMemo(() => {
    if (!items) return [];
    if (!searchQuery) return items;

    return items.filter((stock: Stock) =>
      stock.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.groupId.toString().includes(searchQuery) ||
      stock.items.some(item =>
        item.itemColorHex.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [items, searchQuery]);

  const totalPages = Math.ceil(filteredStocks.length / ITEMS_PER_PAGE);
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStocks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredStocks, currentPage]);

  const handleSearch = (value: string) => {
    setCurrentPage(1);
    setSearchQuery(value);
  };

  return (
    <section className="h-full">
      {/* Top bar */}
      <div className="flex items-center mb-3 min-w-0 gap-2 justify-between">
        <Search
          placeholder="Search items, groups, IDs..."
          onChange={handleSearch}
        />
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Loading Spinner (fallback in case modal fails) */}
      {isLoading && (
        <div
          className="flex-1 flex items-center justify-center"
          style={{ height: "calc(100dvh - 170px)" }}
        >
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* No Results */}
      {!isLoading && currentItems.length === 0 && (
        <div
          className="w-full flex flex-col items-center justify-center"
          style={{ height: "calc(100dvh - 170px)" }}
        >

          
          <div className="relative w-[300px] h-[300px] flex flex-col justify-end items-center">
            <Image
              src="/noitemsfound.svg"
              alt="No Items Found"
              fill
              priority
              className="object-contain"
            />
            <p className="text-gray-500 text-md font-bold absolute bottom-7 animate-pulse">
              No items found
            </p>
          </div>
        </div>
      )}

      {/* Product Grid */}
      {!isLoading && currentItems.length > 0 && (
        <div className="px-1 py-1 rounded-sm bg-white">
          <div
            className="flex-1 overflow-y-auto custom-scrollbar"
            style={{ height: "calc(100dvh - 170px)" }}
          >
            <div className="grid 
                            grid-cols-1 
                            min-[555px]:grid-cols-2
                            min-[920px]:grid-cols-3
                            min-[1200px]:grid-cols-4
                            min-[1400px]:grid-cols-5
                            min-[1600px]:grid-cols-6
                            min-[1800px]:grid-cols-7
                            gap-4 py-3 pl-3 pr-1">
              {currentItems.map((stock: Stock) => (
                <Product key={stock.groupId} {...stock} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
