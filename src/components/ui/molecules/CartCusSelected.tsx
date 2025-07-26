
import Image from "next/image";
import { HiOutlinePhone } from "react-icons/hi";
import { PiUserSwitchLight } from "react-icons/pi";
import { useCheckoutCustomer } from "@/lib/stores/useCheckoutCustomer";

interface CartCusSelectedProps {
  handleCustomerSwitch: () => void
}

export default function CartCusSelected(props: CartCusSelectedProps) {

  const { checkoutCustomer } = useCheckoutCustomer();

  return (
     <div className="flex flex-row items-center justify-between min-h-[60px] mx-2 my-2
                        border border-gray-200 rounded-xs px-2 py-1 shadow-xs text-gray-500">
          <div className="flex flex-row items-center gap-2">
            <Image src={checkoutCustomer.imgUrl || "/man.png"} alt="Customer" width={50} height={50}
                className="w-10 h-10 rounded-full ring-2 ring-blue-300"/>
            <span className="text-sm font-semibold">{checkoutCustomer.name}</span>
          </div>
          <a href={`tel:${checkoutCustomer.phoneNo1}`}
             className='text-[0.8rem] flex items-center gap-1 text-blue-600 hover:underline'>
            <HiOutlinePhone className='text-sm' />
            {checkoutCustomer.phoneNo1}
          </a>
          <span className="text-[0.8rem] hidden sm:block">{checkoutCustomer.typeOfCustomer}</span>
          <button onClick={props.handleCustomerSwitch}>
            <PiUserSwitchLight  
              className="w-6 h-6 text-blue-600 
                        cursor-pointer hover:scale-105 
                        hover:text-blue-600 transition-all 
                        ease-in-out duration-150" />
          </button>
      </div>
  )
}