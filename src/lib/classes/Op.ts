export interface OpInterface {
  percentage: number;
  message: string;

}

export const OP_REMEMBER_KEY = "opdata.openwaremyanmar.site";

class Op {
  op: OpInterface = {
    percentage: 0,
    message: "",
  };

  constructor() {
    this.loadOp();
  }

  saveOp() {
    localStorage.setItem(OP_REMEMBER_KEY, JSON.stringify(this.op));
  }

  loadOp() {
    try {
      const stored = localStorage.getItem(OP_REMEMBER_KEY);

      this.op = stored ? JSON.parse(stored) : { 
        percentage: 0,
        message: "",
       };
    } catch {
      this.op = {
        percentage: 0,
        message: "",
      };
    }
  }

  getOp() {
    return this.op;
  }

  setOp(op: OpInterface) {
    this.op = op;
    this.saveOp();
  }

  clearOp(){
    this.op = {
      percentage: 0,
      message: "",
    };
    this.saveOp();
  }
}

export default Op;