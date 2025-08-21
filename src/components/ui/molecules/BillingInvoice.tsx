"use client";

import { BsFiletypePdf } from "react-icons/bs";
import { FiDownloadCloud } from "react-icons/fi";
import dayjs from "dayjs";
import Link from "next/link";

interface Invoice {
  tranHistId: string;
  expireDate: string;
  planName: string;
  tranAmt: number;
}

interface BillingInvoiceProps {
  invoice: Invoice;
}

export default function BillingInvoice({ invoice }: BillingInvoiceProps) {
  const shortId = invoice.tranHistId?.slice(-4) ?? "0000";
  
  return (
    <div className="min-h-[70px] flex justify-between items-center border-b border-gray-200 text-gray-600 gap-1">
      <div className="flex items-center gap-2">
        <BsFiletypePdf className="text-gray-500/50 w-5 h-5 md:w-6 md:h-6" />
        <span className="text-[0.82rem] md:text-base font-semibold">INV#{shortId}</span>
      </div>

      <div className="flex items-center text-sm text-gray-500 gap-5 select-none px-3">
        <span className="hidden md:block">{dayjs(invoice.expireDate).format("MMM DD YYYY")}</span>
        <span>{invoice.planName}</span>
        <span>MMK {invoice.tranAmt}</span>
        <Link
          href={`/settings/billing-invoicing/invoice/${invoice.tranHistId}`}
        >
           <FiDownloadCloud
              className="w-4 h-4 md:w-5 md:h-5 text-gray-500/70 hover:text-blue-600 hover:scale-105 transition-all cursor-pointer"
           />
        </Link>
       
      </div>
    </div>
  );
}
