import dayjs from "dayjs";

export interface BillingBackend {
    rowId: number,
    bizId: number,
    billingAcc: string,
    currIssueDate: string,
    currExpireDate: string,
    currPlanCode: string,
    currIssueAmt: number,
    currIssueDay: number
}

export const ISVALID = (expireDate: string) => {
    return dayjs(expireDate).isAfter(dayjs());
}

export const CodeToText = (code: string) => {
    switch (code) {
      case "free":
        return "Free Plan";
      case "basic":
        return "Basic Plan";
      case "pro":
        return "Pro Plan";
      case "business":
        return "Business Plan";
      default:
        return "";
    }
}