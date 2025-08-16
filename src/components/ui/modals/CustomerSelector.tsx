"use client";

import { ModalHeader } from "@/components/ui/molecules/ModalHeader";
import Search from "@/components/form/search";
import { useCustomer } from "@/hooks/useCustomer";
import { Customer } from "@/components/data-display/customerCard";
import { useState, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { CustomerRowCard } from "@/components/card/CustomerRowCard";
import Image from "next/image";

export default function CustomerSelector(props: { handleCloseSelector: () => void }) {

  const { customers: data, isLoading } = useCustomer();
  const [searchQuery, setSearchQuery] = useState("");
  const {t} = useTranslation();

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const filteredCustomers = useMemo(() => {
      if (!data) return [];
      if (!searchQuery) return data;
      
      const lowerCaseSearchQuery = searchQuery.toLowerCase();
  
      return data.filter((customer: Customer) => {
        return (
          customer.name.toLowerCase().includes(lowerCaseSearchQuery) || 
          customer.typeOfCustomer.toLowerCase().includes(lowerCaseSearchQuery) ||
          customer.address1.toLowerCase().includes(lowerCaseSearchQuery) ||
          customer.cid.includes(lowerCaseSearchQuery) ||
          customer.phoneNo1.includes(lowerCaseSearchQuery) || 
          customer.phoneNo2.includes(lowerCaseSearchQuery) || 
          customer.city.toLowerCase().includes(lowerCaseSearchQuery)
        );
      });
  
    }, [data, searchQuery]);

   const customers = useMemo(() => {
      // This `useMemo` should now depend on `filteredCustomers`, not `data`.
      // Otherwise, the `customers` variable will always hold all data regardless of the search.
      if (!filteredCustomers) return []; 
      return filteredCustomers;
    }, [filteredCustomers]);

  const renderCustomers = (
      <div className="flex flex-col gap-3">
        {customers?.map((customer: Customer) => (
          <CustomerRowCard key={customer.rowId} {...customer} />
        ))}
      </div>
  )

  const loadinSpinner = (
    <div
      className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-transparent bg-opacity-50 z-50"
    >
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const noResult = (
        <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] w-[300px] h-[300px] flex items-center justify-center">
          <Image
            src="/noitemsfound.svg"
            alt="No Customers Found"
            fill
            priority
            className="object-contain"
            unoptimized
          />
          <p className="text-gray-500 text-md font-bold absolute bottom-7 animate-pulse">
            {t("noCustomersFound")}
          </p>
    </div>
  )

  return (
    <div className="fixed inset-0 backdrop-blur-[1px] flex items-center justify-center px-2 z-60 overflow-hidden"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}>
        <div className="relative h-[80dvh] w-full sm:w-[650px] rounded-lg shadow-xl flex flex-col border border-gray-200 animate-slide-up bg-white ">
           <ModalHeader title={t("hdSelectCustomer")} onClick={props.handleCloseSelector} haveExitButton={true}/>
           <div className="flex flex-col flex-1 overflow-hidden">
            <div className="min-h-[60px] flex flex-row items-center justify-end px-3">
              <Search placeholder={t("searchCustomer")} 
                      onChange={handleSearch} 
                      value={searchQuery}
                      className="border-[0.5px] rounded-sm border-gray-300" />
            </div>
            <div className="flex-1 overflow-y-auto  w-full h-full custom-scrollbar px-2 py-2 border-t-1 border-gray-200">
              {isLoading ? (
                  loadinSpinner
                ) : filteredCustomers.length > 0 ? (
                  renderCustomers
                ) : (
                  noResult
               )}
            </div>
           </div>
        </div>
    </div>
  )
}