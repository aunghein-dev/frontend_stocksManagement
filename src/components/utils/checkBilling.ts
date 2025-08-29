import dayjs from "dayjs";

export function checkBilling(expiredDate : string){
  return !dayjs(expiredDate).isAfter(dayjs());
}

export function checkAvailableUserBasedOnPlan(plan: string) {
  switch (plan) {
    case "free":
      return 1;
    case "basic":
      return 5;
    case "pro":
      return 20;
    case "business":
      return 100;
    default:
      return 0; 
  }
}

export function checkAvailableToCreate(currentUsers: number, 
                                       expiredDate: string,
                                       plan: string) {
      
    
  return !checkBilling(expiredDate) && currentUsers <= checkAvailableUserBasedOnPlan(plan);
}