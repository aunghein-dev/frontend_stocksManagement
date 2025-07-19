// src/app/customers/page.tsx (Customers component)

"use client"

import { FaUsers, FaUserPlus, FaBuilding, FaStore, FaMoneyBillWave } from "react-icons/fa";
import MiniDataCard from "@/components/data-display/atoms/miniDataCard";
import { useCustomer } from "@/hooks/useCustomer";
import { useModalStore } from "@/store/modalStore";
import { useEffect, useMemo, useState } from 'react';
import NewCustomer from "@/components/ui/newCustomerPopUp"; // Your NewCustomer form component
import CustomerCard, {type Customer} from "@/components/data-display/customerCard";
import Search from "@/components/form/search";
import React from "react";
import DeleteCustomer from "@/models/deleteCustomer";
import EditCustomer from "@/models/editCustomer";
// No need to import ConfirmDeleteDialog here if it's only rendered via useModalStore

export default function Customers() {
  const { customers: data, isLoading, error, refresh } = useCustomer();
  const { openModal, closeModal, modalType } = useModalStore(); // Get modalType to decide which modal to render
  const [ newCustomerPopup, setNewCustomerPopup ] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");



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
        customer.cid.includes(lowerCaseSearchQuery) 
      );
    });

  }, [data, searchQuery]);


  const customers = useMemo(() => {
    // This `useMemo` should now depend on `filteredCustomers`, not `data`.
    // Otherwise, the `customers` variable will always hold all data regardless of the search.
    if (!filteredCustomers) return []; 
    return filteredCustomers;
  }, [filteredCustomers]);

  // The handleDelete function now directly calls openModal with the customer data
  const handleDelete = React.useCallback((customer: Customer) => {
    openModal("customerDelete", customer); // Pass the full customer object as modalData
  }, [openModal]);

   // Handler for editing a customer
  const handleEdit = React.useCallback((customer: Customer) => {
    openModal("editCustomer", customer); // <--- NEW: Open edit modal with customer data
  }, [openModal]);


  // This useEffect controls the loading modal's open/close state
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isLoading) {
      openModal("loading");
    } else {
      timer = setTimeout(() => {
        closeModal();
      }, 100);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isLoading, openModal, closeModal]);

  const renderCustomers = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-[calc(100dvh-169px)]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className='flex justify-center items-center min-h-[calc(100dvh-169px)] p-4'>
          <p className="text-red-600 text-lg font-medium text-center p-6 rounded-lg bg-red-50 shadow-md">
            Error loading sales data: {error.message || "An unknown error occurred."}
            <button onClick={refresh} className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors">
              Retry
            </button>
          </p>
        </div>
      );
    }

    if (!customers || customers.length === 0) {
      return (
        <div className='flex justify-center items-center min-h-[calc(100dvh-169px)] p-4'>
          <p className="text-gray-600 text-lg font-medium text-center p-6 rounded-lg bg-gray-50 shadow-md">
            No customers found.
          </p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 px-3 py-2.5">
        {customers.map((customer: Customer) => (
          <div key={customer.rowId}>
            <CustomerCard
              customer={customer}
              onDeleteClick={handleDelete} 
              onEditClick={handleEdit}
            />
          </div>
        ))}
      </div>
    );
  };

  const handleNewCustomer = () => {
    setNewCustomerPopup(true);
  }

  return (
    <div className="overflow-hidden h-full rounded-sm bg-white sm:w-[calc(100vw-224px)] w-[calc(100vw-25px)]">
      <div className="overflow-auto custom-scrollbar pt-0 h-[calc(100dvh-109px)] custom-scrollbar relative">
        <div className="bg-white sticky top-0 left-4 right-0 z-50 min-h-[60px] flex items-center justify-start
                        border-b border-gray-100 px-3">
          <Search
            placeholder="Search Customers"
             onChange={handleSearch}
             value={searchQuery}
          />
        </div>
        <div className="flex flex-col h-full">
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 justify-between pb-4 md:pb-6 border-b border-gray-200 pt-4 px-3">
            <MiniDataCard title={"Total Customers"} value={"45"} icon={<FaUsers className="text-blue-500" />} />
            <MiniDataCard title={"Retailers"} value={"56,000"} icon={<FaStore className="text-purple-500" />} />
            <MiniDataCard title={"Wholesalers"} value={"56,000"} icon={<FaBuilding className="text-orange-500" />} />
            <MiniDataCard title={"Receivables"} value={"56,000"} icon={<FaMoneyBillWave className="text-red-500" />} />
          </div>
          <div className="h-full w-full">
            {renderCustomers()}
          </div>
        </div>
      </div>

      {/* Render NewCustomer Popup */}
      {
        newCustomerPopup && (
          <div className="fixed inset-0 backdrop-blur-[1px] flex items-center justify-center px-2 z-60 overflow-hidden transition-all ease-in-out duration-100"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}>
            <NewCustomer closePopup={() => setNewCustomerPopup(false)}/>
          </div>
        )
      }

      {/* This is where you would render your modals based on modalType from useModalStore */}
      {modalType === "customerDelete" && (
        <DeleteCustomer /> 
      )}

      {
        modalType === "editCustomer" && (
          <EditCustomer />
        )
      }
    
      <button
        onClick={handleNewCustomer}
        className="absolute bottom-5 right-6 bg-blue-100 text-blue-600 hover:bg-blue-200 px-2 py-1 flex justify-center items-center rounded-sm border-[0.5px] border-blue-600 ease-in-out duration-300 text-sm z-50 hover:scale-101 cursor-pointer flex-row shadow-sm hover:shadow-md "
      >
        + New
      </button>
    </div>
  )
}