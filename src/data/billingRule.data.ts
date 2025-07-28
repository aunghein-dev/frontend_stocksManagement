export const BillingRule = [
  {
    rowId: 1,
    code: "free",
    costPerDay: 0,
    limitStorageKb: 512000,
    limitStorageTxt: '500MB',
    longName:  'Free Plan',
    price: 0,
    limitAccountCnt: 1
  },
  {
    rowId: 2,
    code: "basic",
    costPerDay: 200.0,
    limitStorageKb: 5242880,
    limitStorageTxt: '5GB',
    longName:  'Basic Plan',
    price: 6000,
    limitAccountCnt: 5
  },
  {
    rowId: 3,
    code: "pro",
    costPerDay: 666.67,
    limitStorageKb: 15728640,
    limitStorageTxt: '15GB',
    longName:  'Pro Plan',
    price: 20000,
    limitAccountCnt: 20
  },
  {
    rowId: 4,
    code: "business",
    costPerDay: 1666.67,
    limitStorageKb: 52428800.00,
    limitStorageTxt: '50GB',
    longName:  'Business Plan',
    price: 50000,
    limitAccountCnt: 999
  }
]