// src/lib/classes/RememberLogin.ts
export interface RememberLoginInterface {
  remember: string; // Change from String to string
  username: string; // Change from String to string
  password: string; // Change from String to string
}

const REMEMBER_KEY = "rememberloginkey-doorpos.mm.com";

class RememberLogin {
  remember: RememberLoginInterface = {
    remember: "",
    username: "",
    password: "",
  };

  constructor() {
    this.loadRememberLogin();
  }

  saveRememberLogin() {
    localStorage.setItem(REMEMBER_KEY, JSON.stringify(this.remember));
  }

  loadRememberLogin() {
    try {
      const stored = localStorage.getItem(REMEMBER_KEY);
      // Ensure that parsed data also uses primitive strings if coming from external source
      this.remember = stored ? JSON.parse(stored) : { remember: "", username: "", password: "" };
    } catch {
      this.remember = {
        remember: "",
        username: "",
        password: "",
      };
    }
  }

  getRememberLogin() {
    return this.remember;
  }

  setRememberLogin(remember: RememberLoginInterface) {
    this.remember = remember;
    this.saveRememberLogin();
  }

  clearRememberLogin(){
    this.remember = {
      remember: "",
      username: "",
      password: "",
    };
    this.saveRememberLogin();
  }
}

export default RememberLogin;