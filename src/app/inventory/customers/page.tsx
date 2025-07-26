// src/app/customers/page.tsx (Customers component)

"use client"

import { FaUsers, FaBuilding, FaStore, FaMoneyBillWave } from "react-icons/fa";
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
import axios from "axios";
import { useInfo } from "@/hooks/useInfo";
import { useTranslation } from "@/hooks/useTranslation";
import Image from "next/image";
import PageLost404 from "@/components/error/pageLost404";
// No need to import ConfirmDeleteDialog here if it's only rendered via useModalStore

type CustomerDashboardProps = {
  retailerCnt: number;
  wholesalerCnt: number;
  totalCustomers: number;
  totalDue: number;
}

export default function Customers() {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const { customers: data, isLoading, error, refresh } = useCustomer();
  const { openModal, closeModal, modalType } = useModalStore(); // Get modalType to decide which modal to render
  const [ newCustomerPopup, setNewCustomerPopup ] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { business } = useInfo();
  const bizId = business?.businessId;
  const {t} = useTranslation();

  const [dashData, setDashData] = useState<CustomerDashboardProps>({
    retailerCnt: 0,
    wholesalerCnt: 0,
    totalCustomers: 0,
    totalDue: 0,
  });

  
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


   useEffect(() => {
    const fetchDashData = async () => {
      // It's good that you have this check
      if (!bizId) {
        console.warn("bizId is not available yet for dashboard data fetch.");
        return;
      }

      try {
    

        if (!API) {
          console.error("API is not available yet for dashboard data fetch.");
          return;
        }
        
        const { data } = await axios.get(`${API}/customer/dash/biz/${business.businessId}`, { withCredentials: true });
        
        setDashData({
          retailerCnt: data.retailerCnt,
          wholesalerCnt: data.wholesalerCnt,
          totalCustomers: data.totalCustomers,
          totalDue: data.totalDue
        })
        
       
      } catch (err) { // Type the catch error for better access to properties like .message
        console.error("Failed to fetch dashboard data:", err);
        // Provide more specific error message if available
        if (axios.isAxiosError(err)) {
          console.error("Axios error details:", err.response?.data, err.message);
         
        } 
      } 
    };

    fetchDashData();
  }, [bizId ,business?.businessId, API]); // Add API to dependencies as well


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
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
         <div className="flex flex-col items-center justify-center h-[calc(100dvh-108px)] text-red-600">
                   <PageLost404 
                  header={t("msg_wrong")}
                  message={error?.message|| "Check your internet connection."}
                  reload={() => window.location.reload()}
                  />
          </div>
        
      );
    }

    if (!customers || customers.length === 0) {
      return (
         <div className="w-full flex flex-col items-center justify-center py-2"
                  style={{ height: "calc(100dvh - 150px)" }}>
          <div className="relative w-[300px] h-[300px] flex flex-col justify-end items-center">
            <Image
              src="/noitemsfound.svg"
              alt="No Customers Found"
              fill
              priority
              className="object-contain"
            />
            <p className="text-gray-500 text-md font-bold absolute bottom-7 animate-pulse">
              {t("noCusFound")}
            </p>
          </div>
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
    <section className="overflow-hidden h-full rounded-xs bg-white sm:w-[calc(100vw-224px)] w-[calc(100vw-25px)]">
      <div className="overflow-auto custom-scrollbar pt-0 h-[calc(100dvh-109px)] custom-scrollbar relative">
        <div className="bg-white sticky top-0 left-4 right-0 min-h-[60px] flex items-center justify-start
                        border-b border-gray-100 px-3 z-20">
          <Search
            placeholder={t("searchCustomer")}
             onChange={handleSearch}
             value={searchQuery}
             className="border-[0.5px] border-gray-300"
          />
        </div>
        <div className="flex flex-col h-full">
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 justify-between pb-4 md:pb-6 border-b border-gray-200 pt-4 px-3">
            <MiniDataCard title={t("lbl_totCus")} value={dashData.totalCustomers.toString()} icon={<FaUsers className="text-blue-600" />} />
            <MiniDataCard title={t("lbl_retailers")} value={dashData.retailerCnt.toString()} icon={<FaStore className="text-purple-500" />} />
            <MiniDataCard title={t("lbl_wholesalers")} value={dashData.wholesalerCnt.toString()} icon={<FaBuilding className="text-orange-500" />} />
            <MiniDataCard title={t("lbl_receivables")} value={dashData.totalDue.toString()} icon={<FaMoneyBillWave className="text-red-500" />} />
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
            <NewCustomer closePopup={() => setNewCustomerPopup(false)}
              refresh={refresh}/>
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
        className="absolute bottom-10 right-10 bg-blue-100 text-blue-600 hover:bg-blue-200 px-4 py-2.5 flex justify-center items-center rounded-full border-[0.5px] border-blue-600 ease-in-out duration-300 text-md font-semibold z-50 hover:scale-105 cursor-pointer flex-row shadow-sm hover:shadow-md "
      >
        {t("btnTxt_newCus")}
      </button>
    </section>
  )
}