'use client';

import Image from 'next/image';
import { HiOutlinePhone } from "react-icons/hi";
import { useMemo, useState, useRef, useEffect } from 'react'; // Import useRef and useEffect
import { useTranslation } from "@/hooks/useTranslation";
import formatMoney from "@/components/utils/formatMoney";
import { BsThreeDotsVertical } from "react-icons/bs";

// Define the Customer interface based on your Spring Boot model
export interface Customer {
  rowId: number;
  cid: string;
  name: string;
  typeOfCustomer: string;
  address1: string;
  phoneNo1: string;
  phoneNo2: string;
  township: string;
  city: string;
  boughtCnt: number;
  boughtAmt: number;
  customerDueAmt: number;
  customerLastDueDate: string;
  lastShopDate: string;
  imgUrl: string;
  bizId: number;
}

// Define the props for the CustomerCard component
export interface CustomerCardProps {
  customer: Customer;
  onClick?: (customer: Customer) => void;
  // Optional: Add handlers for dropdown actions if they are to be handled externally
  onEditClick?: (customer: Customer) => void;
  onDeleteClick?: (customer: Customer) => void;
}

export default function CustomerCard({ customer, onClick, onEditClick, onDeleteClick }: CustomerCardProps) {
  const { t } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref for the dropdown container

  const defaultImageUrl = useMemo(() => "/man.png", []);

  const imgSrc = useMemo(() => {
    return customer.imgUrl && customer.imgUrl.trim().toUpperCase() !== "NULL"
      ? customer.imgUrl
      : defaultImageUrl;
  }, [customer.imgUrl, defaultImageUrl]);


  
  const customerStatus = useMemo(() => {
    if (customer.customerDueAmt && customer.customerDueAmt > 0) {
      return { text: t("bgd_due"), color: "bg-red-400" };
    }
    return { text: t("bgd_paid"), color: "bg-green-400" };
  }, [customer.customerDueAmt, t]);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card onClick from firing
    setIsDropdownOpen(prev => !prev);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card onClick from firing
    setIsDropdownOpen(false); // Close dropdown
    onEditClick?.(customer); // Call external edit handler
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card onClick from firing
    setIsDropdownOpen(false); // Close dropdown
    onDeleteClick?.(customer); // Call external delete handler
  };

  return (
    <div
      className="flex h-[140px] w-full bg-white border border-gray-200 rounded-lg overflow-hidden
                 text-gray-800 relative shadow-xs
                 hover:shadow-md transition-all ease-in duration-100 flex-col"
      // Only call onClick if the dropdown is not open, or specifically handle it differently
      onClick={() => !isDropdownOpen && onClick?.(customer)}
    >
      {/* Status Badge */}
      <div className={`absolute top-0 left-0 ${customerStatus.color}
                      text-white text-[0.8rem] px-2
                      rounded-tl-lg rounded-br-xl  z-10`}>
        <span>{customerStatus.text}</span>
      </div>

      <div className='flex flex-1 min-w-0'>
        {/* Image Section */}
        <div className='flex-shrink-0 ml-2 my-auto relative'>
          {!imageLoaded && (
            <div className="w-16 h-16 bg-gray-200 rounded-md animate-pulse" />
          )}
          <Image
            src={imgSrc}
            alt={customer.name}
            width={64}
            height={64}
            className={`rounded-md object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultImageUrl;
              setImageLoaded(true);
            }}
          />
        </div>

        {/* Details Section */}
        <div className='flex flex-col justify-center ml-3 py-2 min-w-0'>
          <span className='mb-0.5 font-semibold text-sm truncate'>{customer.name}</span>
          {customer.typeOfCustomer && (
            <span className='text-[0.8rem] text-gray-500 truncate'>{customer.typeOfCustomer}</span>
          )}
          {customer.city && (
            <span className='text-[0.8rem] text-gray-500 truncate'>{customer.city}</span>
          )}
          {customer.customerDueAmt > 0 && (
            <span className='text-[0.8rem] font-medium text-red-600'>
              {t("due")}: {formatMoney(customer.customerDueAmt)}
            </span>
          )}
       
        </div>
      </div>

      {/* Phone Numbers Section */}
      <div className='flex flex-row justify-evenly items-start gap-x-4 px-3 py-2 flex-shrink-0'>
        {customer.phoneNo1 && (
          <a href={`tel:${customer.phoneNo1}`}
             className='text-[0.8rem] flex items-center gap-1 text-blue-600 hover:underline'>
            <HiOutlinePhone className='text-sm' />
            {customer.phoneNo1}
          </a>
        )}
        {customer.phoneNo2 && (
          <a href={`tel:${customer.phoneNo2}`}
             className='text-[0.8rem] flex items-center gap-1 text-blue-600 hover:underline'>
            <HiOutlinePhone className='text-sm' />
            {customer.phoneNo2}
          </a>
        )}
      </div>

      {/* Dropdown Toggle Button */}
      <div className="absolute top-2 right-2" ref={dropdownRef}> {/* Wrap button and dropdown in a div with ref */}
        <button
          className='text-gray-400 hover:text-gray-700 text-xl cursor-pointer
                     transition-colors duration-200 p-1 rounded-full hover:bg-gray-100'
          onClick={handleDropdownToggle}
          aria-label="More options"
        >
          <BsThreeDotsVertical />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div
            className='absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg
                       py-0.5 z-20' // Higher z-index to ensure it's on top
            onClick={(e) => e.stopPropagation()} // Prevent card click when clicking inside dropdown
          >
            <button
              onClick={handleEdit}
              className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
            >
              {t("btnTxt_editCus")}
            </button>
            <button
              onClick={handleDelete}
              className='block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700'
            >
              {t("btnTxt_deleteCus")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}