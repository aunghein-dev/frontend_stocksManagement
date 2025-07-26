"use client";

import BillingCard from "@/components/card/BillingCard";
import BillingInvoice from "@/components/ui/molecules/BillingInvoice";
import BillingData from "@/data/billing.data";
import BillingChangeConfirm from "@/models/BillingChangeConfirm";
import React from "react";

export default function BillingAndInvocingPage() {

  const data = BillingData;
  const planPriority = ["Free Plan","Basic Plan", "Pro Plan", "Business Plan"];
  const [openBillingChange, setOpenBillingChange] = React.useState(false);
  const [selectedObj, setSelectedObj] = React.useState({
    code: "",
    action: "",
  });

  const handleSelect = (code: string, action: string) => {
    setSelectedObj({
      code: code,
      action: action,
    });
  }
  
  function getPlanButtonLabel(planName: string, currentPlan: string) {
    const currentIndex = planPriority.indexOf(currentPlan);
    const planIndex = planPriority.indexOf(planName);

    if (planIndex === currentIndex) return "Current Plan";
    if (planIndex > currentIndex) return "Upgrade";
    return "Downgrade";
  }

  const handleConfirmation = (index: number) => {
    console.log("SELECTED PLAN INDEX:", index);
    
    setOpenBillingChange(true);
  }


  const currentPlan = "Pro Plan";
  return (
     <div className="overflow-hidden h-full rounded-xs bg-white p-1 py-3">
      <div className="overflow-y-auto custom-scrollbar h-[calc(100dvh-136px)] custom-scrollbar">
        <div className="flex-1 w-full px-1">
            <div className="grid 
                        grid-cols-2
                        min-[580px]:grid-cols-2
                        min-[640px]:grid-cols-2
                        min-[700px]:grid-cols-2
                        min-[880px]:grid-cols-3
                        min-[1120px]:grid-cols-4  
                        gap-2.5 w-full  px-1">
          {data.map((plan,index) => (
            <BillingCard
              key={plan.name}

              plan={{
                ...plan,
                buttonText: getPlanButtonLabel(plan.name, currentPlan)
              }}
            />
          ))}
        </div>

        <div className="flex flex-col mt-6 px-2 md:px-4 lg:px-6">
          <span className="text-md font-semibold text-gray-700 
                           border-b-[0.5px] border-gray-200 pb-4">
            Billing History
          </span>
          <div>
            <BillingInvoice/>
          </div>
        </div>
        </div>

      </div>

      {
        openBillingChange && <BillingChangeConfirm
                              
                              />
      }
    </div>
  );
}