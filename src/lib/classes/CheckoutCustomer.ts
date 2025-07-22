
export interface CheckoutCustomerInterface {
  rowId: number;
  cid: string;
  imgUrl: string | "" ;
  name: string;
  typeOfCustomer: string;
  phoneNo1: string;
}

const REMEMBER_KEY = "checkoutCustomerCart-doorpos.mm.com";

class CheckoutCustomer {
  remember: CheckoutCustomerInterface = {
    rowId: 0,
    cid: "",
    imgUrl: "/man.png",
    name: "Defatult",
    typeOfCustomer: "Default",
    phoneNo1: "Unknown",
  };

  constructor() {
    this.loadCheckoutCustomer();
  }

  saveCheckoutCustomer() {
    localStorage.setItem(REMEMBER_KEY, JSON.stringify(this.remember));
  }

  loadCheckoutCustomer() {
    try {
      const stored = localStorage.getItem(REMEMBER_KEY);
      // Ensure that parsed data also uses primitive strings if coming from external source
      this.remember = stored ? JSON.parse(stored) : 
        { imgUrl: "/man.png", name: "Defatult", typeOfCustomer: "Default", phoneNo1: "Unknown" };
    } catch {
      this.remember = {
        rowId: 0,
        cid: "",
        imgUrl: "/man.png",
        name: "Defatult",
        typeOfCustomer: "Default",
        phoneNo1: "Unknown",
      };
    }
  }

  getCheckoutCustomer() {
    return this.remember;
  }

  setCheckoutCustomer(remember: CheckoutCustomerInterface) {
    this.remember = remember;
    this.saveCheckoutCustomer();
  }

  clearRememberLogin(){
    this.remember = {
      rowId: 0,
      cid: "",
      imgUrl: "/man.png",
      name: "Defatult",
      typeOfCustomer: "Default",
      phoneNo1: "Unknown",
    };
    this.saveCheckoutCustomer();
  }
}

export default CheckoutCustomer;