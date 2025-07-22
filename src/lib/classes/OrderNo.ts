
export interface OrderNoInterface {
  orderNo: string;
}

const REMEMBER_KEY = "orderNoInApp-doorpos.mm.com";

class OrderNo {
  remember: OrderNoInterface = {
    orderNo: "",
  };

  constructor() {
    this.loadOrderNo();
  }

  saveOrderNo() {
    localStorage.setItem(REMEMBER_KEY, JSON.stringify(this.remember));
  }

  loadOrderNo() {
    try {
      const stored = localStorage.getItem(REMEMBER_KEY);
      // Ensure that parsed data also uses primitive strings if coming from external source
      this.remember = stored ? JSON.parse(stored) : 
        { orderNo: "" };
    } catch {
      this.remember = {
        orderNo: "",
      };
    }
  }

  getOrderNo() {
    return this.remember;
  }

  setOrderNo(remember: OrderNoInterface) {
    this.remember = remember;
    this.saveOrderNo();
  }

  clearOrderNo(){
    this.remember = {
      orderNo: "",
    };
    this.saveOrderNo();
  }
}

export default OrderNo;