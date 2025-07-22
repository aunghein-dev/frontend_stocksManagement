"use client";

import { ModalHeader } from "@/components/ui/molecules/ModalHeader";
import Search from "@/components/form/search";
import { useCustomer } from "@/hooks/useCustomer";
import { Customer } from "@/components/data-display/customerCard";
import { CustomerRowCard } from "@/components/data-display/customerRowCard";
import { useState, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export default function CustomerSelector(props: { handleCloseSelector: () => void }) {

  const { customers: data } = useCustomer();
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

  const renderCustomers = () => {
    return (
      <div className="flex flex-col gap-3">
        {customers?.map((customer: Customer) => (
          <CustomerRowCard key={customer.rowId} {...customer} />
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 backdrop-blur-[1px] flex items-center justify-center px-2 z-60 overflow-hidden"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}>
        <div className="relative h-[80dvh] w-full sm:w-[650px] rounded-xl shadow-xl flex flex-col border border-gray-200 animate-slide-up bg-white ">
           <ModalHeader title={t("hdSelectCustomer")} onClick={props.handleCloseSelector} haveExitButton={true}/>
           <div className="flex flex-col flex-1 overflow-hidden pb-2">
            <div className="min-h-[60px] flex flex-row items-center justify-end px-3 mb-2">
              <Search placeholder={t("searchCustomer")} onChange={handleSearch} value="" />
            </div>
            <div className="flex-1 overflow-y-auto  w-full h-full custom-scrollbar px-2">
              {renderCustomers()}
            </div>
           </div>
        </div>
    </div>
  )
}