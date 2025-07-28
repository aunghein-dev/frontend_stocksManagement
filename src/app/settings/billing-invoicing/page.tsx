"use client";

import BillingCard from "@/components/card/BillingCard";
import LicenseInfo from "@/components/card/LicenseInfo";
import PaySlipEntry from "@/components/ui/modals/PaySlipEntry";
import BillingData from "@/data/billing.data";
import { useBilling } from "@/hooks/useBilling";
import BillingChangeConfirm, { BillingInfoProps } from "@/models/BillingChangeConfirm";
import React, { useEffect, useMemo, useCallback } from "react"; 
import dayjs from "dayjs";
import { BillingRule } from "@/data/billingRule.data";
import { AmBillingReceive } from "@/data/AmBillingReceive.data";

import { CodeToText, BillingBackend } from "@/components/utils/billingUtils"; 
import BillingInvoiceList from "@/components/ui/cells/BillingInvoiceList";
import { useInvoice } from "@/hooks/useInvoice";


export interface SelectedPlan {
  code: string;
  action: string;
}

// Helper functions that depend on component scope should be memoized or defined outside if possible.
// These are now defined outside or as useCallback where appropriate.

// Helper function for cancel button text (can be outside if no external dependencies)
const getCancelBtnText = (action: string) => {
  return action === "Upgrade" ? "Cancel Upgrade" : "Cancel Downgrade";
};

// Helper function for confirm button text (can be outside if no external dependencies)
const getConfirmBtnText = (action: string) => {
  return action === "Upgrade" ? "Confirm and Pay" : "Confirm";
};

export default function BillingAndInvocingPage() {
  const { billing, isLoading, error } = useBilling();
  const { invoices, isLoading: isLoadingInvoices } = useInvoice();
  const data = BillingData;
  const planPriority = useMemo(() => ["Free Plan", "Basic Plan", "Pro Plan", "Business Plan"], []);

  const [openBillingChange, setOpenBillingChange] = React.useState(false);
  const [paySlipEntryOpen, setPaySlipEntryOpen] = React.useState(false);

  const [selectedPlan, setSelectedPlan] = React.useState<SelectedPlan>({
    code: "",
    action: "",
  });

  const LOADING = isLoading || isLoadingInvoices;

  const getNewPlanPrice = (code: string) => {
    console.log("getNewPlanPrice called with code:", code);
    
    const newPlan = BillingRule.find((plan) => plan.code === code);
    return newPlan ? newPlan.price : 0;
  };



  // Memoize getPlanButtonLabel as it depends on planPriority and currentPlanDisplayName
  const getPlanButtonLabel = useCallback((planName: string, currentPlanName: string) => {
    const currentIndex = planPriority.indexOf(currentPlanName);
    const planIndex = planPriority.indexOf(planName);

    if (planIndex === currentIndex) return "Current Plan";
    if (planIndex > currentIndex) return "Upgrade";
    return "Downgrade";
  }, [planPriority]); // Depends on planPriority

  const remainingDay = useMemo(() => {
    if (billing?.currExpireDate) {
      const remainingDays = dayjs(billing.currExpireDate).diff(dayjs(), "day");
      return remainingDays > 0 ? remainingDays : 0;
    }
    return 0;
  },[billing]);
  const remainingCredit = useMemo(() => {
    return Math.floor(remainingDay * (billing?.currIssueAmt / billing?.currIssueDay));
  },[billing, remainingDay]);

  const totalPriceNewCost = useMemo(() => {
    return getNewPlanPrice(selectedPlan.code) - remainingCredit
  },[ selectedPlan.code, remainingCredit]);

  
  
  // Memoize the info object for the modal
  const info: BillingInfoProps = useMemo(() => {
    if (!selectedPlan.code) {
      return {
        upgradeOrDowngrade: "",
        subHeaderMess: "",
        desirablePlan: "",
        availablePayment: "",
        receiverNumber: "",
        billingAcc: "",
        effectiveDate: "",
        expiredDate: "",
        remainingDay: "",
        remainingDebit: "",
        total: "",
        cancelBtnText: "",
        confirmBtnText: "",
      };
    }

    return {
      upgradeOrDowngrade: selectedPlan.action,
      subHeaderMess: selectedPlan.action === "Upgrade" ? "Upgrade to" : "Downgrade to",
      desirablePlan: CodeToText(selectedPlan.code),
      availablePayment: AmBillingReceive.amBillingReceivingProvider1+ "/" +
                        AmBillingReceive.amBillingReceivingProvider2+ "/" +
                        AmBillingReceive.amBillingReceivingProvider3,
      receiverNumber: "09799103451",
      billingAcc: billing?.billingAcc.substring(0, 8)+"..." || "N/A", 
      effectiveDate: dayjs().format("DD MMM YYYY"),
      expiredDate: dayjs().add(1, 'month').format("DD MMM YYYY"),
      remainingDay: `${remainingDay.toString()} days`, // Mock - consider deriving this from dates
      remainingDebit: `${remainingCredit.toString()} MMK`, // Mock - consider deriving this from billing data
      total: `${totalPriceNewCost} MMK`, // Mock - consider deriving this from billing data
      cancelBtnText: getCancelBtnText(selectedPlan.action),
      confirmBtnText: getConfirmBtnText(selectedPlan.action),
    };
  }, [selectedPlan, billing, remainingCredit, remainingDay, totalPriceNewCost]); // Dependencies: selectedPlan and billing

  // Effect to open the billing change modal when a plan is selected
  useEffect(() => {
    if (selectedPlan.code) {
      setOpenBillingChange(true);
    }
  }, [selectedPlan]);

  // Memoized event handlers
  const handleToogleBillingConfirm = useCallback(() => {
    setOpenBillingChange(false);
  }, []);

  const handleContinue = useCallback(() => {
    setOpenBillingChange(false);
    setPaySlipEntryOpen(true);
  }, []);

  const handleChangePlan = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPaySlipEntryOpen(false);
    console.log(info);
    // Add logic to submit the plan change
  }, [info]);

  // Derive currentPlanDisplayName directly from billing data
  const currentPlanDisplayName = useMemo(() => CodeToText(billing?.currPlanCode), [billing]);
 

  // --- Conditional Rendering for Loading/Error States ---
  if (LOADING || !billing) {
    return (
      <div className="overflow-hidden h-[90dvh] rounded-xs bg-white p-1 py-8 flex items-center justify-center">
         <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500"></div>
         <span className="text-gray-400 ml-2 text-sm">Loading Billing Data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-hidden h-full rounded-xs bg-white p-1 py-8 flex items-center justify-center">
        <p className="text-red-600">Error loading billing data: {error.message || "Unknown error"}</p>
      </div>
    );
  }

 

  // --- Main Render ---
  return (
    <div className="overflow-hidden h-full rounded-xs bg-white p-1 py-8">
      <div className="h-[calc(100dvh-176px)] overflow-y-auto custom-scrollbar">
        <div className="flex-1 w-full px-1 custom-scrollbar">
          <div className="grid
                        grid-cols-2
                        min-[580px]:grid-cols-2
                        min-[640px]:grid-cols-2
                        min-[700px]:grid-cols-2
                        min-[880px]:grid-cols-3
                        min-[1120px]:grid-cols-4
                        gap-2 w-full md:px-6 px-1 md:gap-2.5">
            {data.map((plan) => (
              <BillingCard
                key={plan.name}
                className={``}
                setSelectedPlan={setSelectedPlan}
                plan={{
                  ...plan,
                  buttonText: getPlanButtonLabel(plan.name, currentPlanDisplayName)
                }}
              />
            ))}
          </div>

          <div className="px-2 md:px-4 lg:px-6 flex flex-col mt-6">
            <span className="text-md font-semibold text-gray-700
                           pb-4 border-b-[0.5px] border-gray-200 mb-5">
              Plan Information
            </span>
            {/* Pass the entire billing object to LicenseInfo */}
            <LicenseInfo
              billing={billing as BillingBackend} // Cast to ensure correct type is passed
            />
          </div>

          <div className="flex flex-col mt-6 px-2 md:px-4 lg:px-6">
            <span className="text-md font-semibold text-gray-700
                           border-b-[0.5px] border-gray-200 pb-4">
              Billing History
            </span>
            <div>
              <BillingInvoiceList
                loading={LOADING}
                invoices={invoices}
              />
            </div>
          </div>
        </div>
      </div>

      {openBillingChange &&
        <BillingChangeConfirm
          info={info}
          handleToogleBillingConfrim={handleToogleBillingConfirm}
          handleContinue={handleContinue}
        />
      }

      {paySlipEntryOpen &&
        <PaySlipEntry
          setPaySlipEntryOpen={setPaySlipEntryOpen}
          processing={false}
          handleChangePlan={handleChangePlan}
        />
      }
    </div>
  );
}