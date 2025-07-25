import { Customer } from "./customerCard";
import Image from "next/image";
import { HiOutlinePhone } from "react-icons/hi";
import { FaLocationDot } from "react-icons/fa6";
import { useCheckoutCustomer } from "@/lib/stores/useCheckoutCustomer";
import { useTranslation } from "@/hooks/useTranslation";


export const CustomerRowCard = (props: Customer) => {

   const { checkoutCustomer, setCheckoutCustomer, clearCheckoutCustomer } = useCheckoutCustomer();

  const isSelected = checkoutCustomer.rowId === props.rowId;
  const {t} = useTranslation();


  const handleToggle = () => {
    if (isSelected) {
      clearCheckoutCustomer();
    } else {
      setCheckoutCustomer({
        rowId: props.rowId,
        cid: props.cid,
        imgUrl: props.imgUrl,
        name: props.name,
        typeOfCustomer: props.typeOfCustomer,
        phoneNo1: props.phoneNo1,
      });
    }
  };


 const typeCustomerStyle = (typeOfCustomer: string) => {
  switch (typeOfCustomer) {
    case "Default":
      return "bg-gray-100 text-gray-600 border-gray-500";
    case "Wholesaler":
      return "bg-green-100 text-green-600 border-green-500";
    case "Retailer":
      return "bg-blue-100 text-blue-600 border-blue-500";
    default:
      return "bg-gray-100 text-gray-600 border-gray-500";
  }
};

  const badgeStyle = (isDued: boolean) => {
    if(isDued) {
      return "bg-red-100 text-red-600";
    } else {
      return "bg-green-100 text-green-600";
    }
  }

  const badgeText = (isDued: boolean) => {
    if(isDued) {
      return "Overdue";
    } else {
      return "Active";
    }
  }

  return (
    <div className="flex h-[100px] w-full bg-white border border-gray-200 rounded-xl overflow-hidden
                 relative shadow-xs
                 hover:shadow-md transition-all ease-in duration-100 flex-row items-center justify-between px-2
                 text-right text-gray-700">

              <div className={`absolute top-0 left-0 rounded-tl-xl 
                               text-xs font-semibold
                               rounded-br-xl px-2 py-0.5 ${badgeStyle(props.customerDueAmt > 0)}`}>
                  {badgeText(props.customerDueAmt > 0)}
              </div>
              
              <div className="flex flex-row items-center justify-start text-left min-w-[190px]">
                 <Image src={props.imgUrl || "/man.png"}
                    width={50} height={50} 
                    className="rounded-full"
                    alt={props.name} />
                  <div className="flex flex-col gap-1 ml-2">
                    <span
                      className="text-xs sm:text-sm font-semibold max-w-[200px] cursor-pointer"
                      title={props.name} // Tooltip for full name on hover
                    >
                      {/* In-line truncation logic */}
                      {props.name.length > 20
                        ? `${props.name.slice(0, 20)}...`
                        : props.name}
                    </span>
                    <a href={`tel:${props.phoneNo1}`}
                            className='text-[0.8rem] flex items-center gap-1 text-blue-600 hover:underline'>
                          <HiOutlinePhone className='text-sm' />
                          {props.phoneNo1}
                    </a>
                     <span className="text-xs text-gray-400">{props.cid}</span>
                  </div>
                 
              </div>
             

              <span className="text-xs h-[60px] w-[60px] hidden sm:flex flex-col items-center justify-center
                              bg-red-50 rounded-full text-red-700 font-semibold
                              border-[0.5px] border-red-100">
                {props.customerDueAmt}
              </span>


              <span className={`text-[0.7rem] ml-3 px-2 py-1 rounded-2xl border-[0.5px] hidden sm:block
                              ${typeCustomerStyle(props.typeOfCustomer)}`}>{props.typeOfCustomer}</span>

               <a
                href={`https://www.google.com/maps/place/${props.city}/@4,-72z/`}
                title="Visit Myanmar on Google Maps"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-row items-center gap-1 text-center" >
                <FaLocationDot className="w-4 h-4 text-blue-400" />     
                <span className="sm:text-sm text-xs">{props.city}</span>   
              </a>


              <div className="min-w-[70px] h-full flex items-center justify-end">
                  <button
                    className={`${isSelected ? 
                              "bg-pink-100 text-pink-600 border-pink-500" : 
                              "bg-gray-100 text-gray-600 border-gray-500"}    
                                text-xs cursor-pointer
                                transition-colors duration-200 px-2 py-1 rounded-full`}
                    onClick={handleToggle}
                    aria-label="More options"
                  >
                    {isSelected ?  t("btnTxt_addedCus") : t("btnTxt_addCus")}
                  </button>
              </div>
              


    </div>
  );
};