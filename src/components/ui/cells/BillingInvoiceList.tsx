"use client";


import BillingInvoice from "../molecules/BillingInvoice";

export interface Invoice {
  rowId: number;
  billedBy: string;
  billedDate: string;
  billedAcc: string;
  bizName: string;
  expireDate: string;
  issueDate: string;
  issueDay: number;
  issueMonthCnt: number;
  planCode: string;
  planName: string;
  tranAmt: number;
  tranHistId: string;
  tranProvider: string;
  bizId: number;
}

interface InvoicesListProps {
  loading: boolean;
  invoices: Invoice[];
}

export default function BillingInvoiceList({
  loading,
  invoices,
}: InvoicesListProps) {

  if(loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {
        invoices.map((invoice) => (
          <BillingInvoice 
            key={invoice.rowId}
            invoice={invoice}
          />
        ))
      }
    </div>
  );
}