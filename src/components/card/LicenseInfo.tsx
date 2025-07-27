import { GrLicense } from "react-icons/gr";
import dayjs from "dayjs";
import { BillingBackend, CodeToText, ISVALID } from "../utils/billingUtils";


export default function LicenseInfo({billing}: {billing: BillingBackend}) {

  const customLiRow = (subHeader: string, value : string) => {
    return (
      <li className="flex items-center justify-between text-[0.8rem]">
        <span className="font-semibold">{subHeader}:</span>
        <span className="text-gray-500">{value}</span>
      </li>
    );
  };

  return (
    <div className="border-1 border-gray-200 rounded-md max-w-md max-auto h-[180px]
                    flex flex-col p-4 text-gray-600 shadow-xs">
        <span className="border-b-1 border-gray-200 pb-1.5 text-base
                         flex flex-row items-center gap-2">
                      <GrLicense className="h-4 w-4 text-blue-600"/> 
                      License Information
        </span>

        <ul className="flex flex-col gap-[4px] mt-2">
          {customLiRow("Product Key", CodeToText(billing.currPlanCode))}
          {customLiRow("Status", ISVALID(billing.currExpireDate) ? "Active" : "Expired")}
          {customLiRow("Type", "Perpetual License")}
          {customLiRow("Issued Date", dayjs(billing.currIssueDate).format("MMM DD YYYY"))}
          {customLiRow("Expiry Date", dayjs(billing.currExpireDate).format("MMM DD YYYY"))}
        </ul>
    </div>
  );
}