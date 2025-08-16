import { Button } from "@/components/ui/atoms/Button";
import { AiFillExclamationCircle } from "react-icons/ai";


export interface BillingInfoProps {
  upgradeOrDowngrade: string;
  subHeaderMess: string;
  desirablePlan: string;
  availablePayment: string;
  receiverNumber: string;
  billingAcc: string;
  effectiveDate: string;
  expiredDate: string;
  remainingDay: string;
  remainingDebit: string;
  total: string;
  cancelBtnText: string;
  confirmBtnText: string;
}
interface BillingChangeConfirmProps {
  info: BillingInfoProps
  handleToogleBillingConfrim: () => void;
  handleContinue: () => void
}

export default function BillingChangeConfirm(
  { handleToogleBillingConfrim, handleContinue, info }: BillingChangeConfirmProps) {

  const planPriority = ["Free Plan","Basic Plan", "Pro Plan", "Business Plan"];
  const customLiRow = (subHeader: string, value : string) => {

    const customBold = planPriority.includes(value) ? "font-semibold" : "";
    
    return (
      <li className="flex items-center justify-between py-1">
        <span>{subHeader}</span><span className={customBold}>{value}</span>
      </li>
    );
  };

  const remaingRow = (subHeader: string, value : string) => {
    return (
      <li className="flex items-center justify-between py-1 text-gray-500/90">
        <span>{subHeader}</span><span>{value}</span>
      </li>
    );
  };

  return (
     <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-90">
      <div className="bg-white rounded-lg 
                      h-[85dvh] 
                      min-[1270px]:h-[86dvh]
                      min-[1400px]:h-[74dvh]
                      shadow-2xl w-[95dvw] max-w-lg 
                      px-4 py-6 space-y-5 animate-fade-in text-gray-700 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col gap-3 min-h-[80px] px-1">
          <span className="text-[1.1rem] sm:text-xl font-semibold">
          <span>{info.upgradeOrDowngrade}</span> your plan to 
          <span className="text-blue-600"> {info.desirablePlan}</span>
          </span>
          <span className="text-gray-400 text-sm">
  You&rsquo;re just a step away from enjoying <span>{info.desirablePlan}</span> exclusive features!
</span>
        </div>
       
        <div className="bg-gray-100/90 h-[360px] w-full rounded-sm p-4 text-sm">
            <ul className="flex flex-col gap-2">
              {customLiRow("Plan:", info.desirablePlan || "")}
              {customLiRow("Available Payment:", info.availablePayment || "")}
              {customLiRow("Receiver:", "09799103451")}
              {customLiRow("Billing Account:", info.billingAcc || "")}
              {customLiRow("Effective Date:", info.effectiveDate || "")}
              {customLiRow("Expired Date:", info.expiredDate || "")}
              <span className="border-b-[1px] border-dashed border-gray-300 mt-2"></span>
            </ul>

            <ul className="mt-4">
              {remaingRow("Remaing time on Current Plan:", info.remainingDay || "0 day")}
              {remaingRow("Remaing debits on Current Plan:", info.remainingDebit || "0 MMK")}
             
              <li className="flex items-center justify-between mt-4 ">
                <span className="flex items-center gap-1 font-bold">
                  <AiFillExclamationCircle className="text-gray-500 w-5 h-5" /> Total:
                </span>
                <span className="font-bold">
                  {info.total || "0 MMK"}
                </span>
              </li>
            </ul> 
        </div>

        <div className="px-1.5 min-h-[45px]">
          <span className="text-sm text-gray-500/90 font-medium
                          ">Do you have any questions or need assistance, feel free to 
            <span className="text-blue-600"> contact us.</span>
          </span>
        </div>

        <div className="flex justify-end gap-2 px-1">
          <Button size="sm" variant="border" 
                  onClick={handleToogleBillingConfrim}>
              {info.cancelBtnText}
          </Button>
          <Button size="sm" variant="primary" 
                  onClick={handleContinue}>
              {info.confirmBtnText}
          </Button>
        </div>

      </div>
    </div>
  )
}