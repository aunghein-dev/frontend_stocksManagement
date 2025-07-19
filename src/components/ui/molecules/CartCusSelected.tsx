
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
     <div className="flex flex-row items-center justify-between min-h-[60px]  mx-1 my-2
                        border border-gray-200 rounded-2xl px-2 py-1 shadow-xs">
          <div className="flex flex-row items-center gap-2">
            <Image src="/man.png" alt="Customer" width={50} height={50}/>
            <span>{checkoutCustomer.name}</span>
          </div>
          <a href={`tel:${checkoutCustomer.phoneNo1}`}
             className='text-[0.8rem] flex items-center gap-1 text-blue-600 hover:underline'>
            <HiOutlinePhone className='text-sm' />
            {checkoutCustomer.phoneNo1}
          </a>
            <span>Retailer</span>
          <button onClick={props.handleCustomerSwitch}>
            <PiUserSwitchLight  
              className="w-6 h-6 text-blue-400 
                        cursor-pointer hover:scale-105 
                        hover:text-blue-500 transition-all 
                        ease-in-out duration-150" />
          </button>
      
      </div>
  )
}