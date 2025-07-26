const BillingData = [
  {
    code: "free",
    name: "Free Plan",
    pricePerMonth: "0 MMK/mth",
    features: {
      userLimit: "1 user",
      storageLimit: "500MB storage",
      versionSupport: "Basic versions",
      haveAdminPanel: false,
      isCustomizable: false,
      support: "No support"
    }

  },
  {
    code: "basic",
    name: "Basic Plan",
    pricePerMonth: "6000 MMK/mth",
    features: {
      userLimit: "5 users",
      storageLimit: "5GB storage",
      versionSupport: "Basic versions",
      haveAdminPanel: false,
      isCustomizable: false,
      support: "24/7 support"
    }
  },
  {
    code: "pro",
    name: "Pro Plan",
    pricePerMonth: "20000 MMK/mth",
    features: {
      userLimit: "20 users",
      storageLimit: "15GB storage",
      versionSupport: "Advanced versions",
      haveAdminPanel: false,
      isCustomizable: false,
      support: "24/7 support"
    }
  },
  {
    code: "business",
    name: "Business Plan",
    pricePerMonth: "50000 MMK/mth",
    features: {
      userLimit: "Unlimited users",
      storageLimit: "50GB storage",
      versionSupport: "Premium versions",
      haveAdminPanel: true,
      isCustomizable: true,
      support: "Premium support"
    }
  },
]

export default BillingData