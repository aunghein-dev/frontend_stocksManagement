// CustomerSelector.tsx
import { ModalHeader } from "@/components/ui/molecules/ModalHeader";
import Search from "@/components/form/search";
import { useCustomer } from "@/hooks/useCustomer";
import { Customer } from "@/components/data-display/customerCard";
import { CustomerRowCard } from "@/components/data-display/customerRowCard";

export default function CustomerSelector(props: { handleCloseSelector: () => void }) {

  const { customers, isLoading, error, refresh } = useCustomer();
  
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
        <div className="relative h-[80dvh] w-full sm:w-[650px] rounded-lg shadow-xl flex flex-col border border-gray-200 animate-slide-up bg-white ">
           <ModalHeader title="Select Customers" onClick={props.handleCloseSelector} />
           <div className="flex flex-col flex-1 overflow-hidden pb-2">
            <div className="min-h-[60px] flex flex-row items-center justify-end px-3 mb-2">
              <Search placeholder="Search for customers" onChange={() => {}} value="" />
            </div>
            <div className="flex-1 overflow-y-auto  w-full h-full custom-scrollbar px-2">
              {renderCustomers()}
            </div>
           </div>
        </div>
    </div>
  )
}