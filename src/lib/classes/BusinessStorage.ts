// businessStorage.ts
export interface BusinessMemory {
  bizId: number | null;
}

const REMEMBER_KEY = "bizId-doorpos.mm.com";

export class BusinessStorage {
  private remember: BusinessMemory = { bizId: null };

  constructor() {
    this.loadBusiness();
  }

  private saveBusiness() {
    localStorage.setItem(REMEMBER_KEY, JSON.stringify(this.remember));
  }

  private loadBusiness() {
    try {
      const stored = localStorage.getItem(REMEMBER_KEY);
      this.remember = stored ? JSON.parse(stored) as BusinessMemory : { bizId: null };
    } catch {
      this.remember = { bizId: null };
    }
  }

  getBusiness(): BusinessMemory {
    return this.remember;
  }

  setStorage(remember: BusinessMemory) {
    this.remember = remember;
    this.saveBusiness();
  }

  clearBusiness() {
    this.remember = { bizId: null };
    this.saveBusiness();
  }
}
