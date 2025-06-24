import { create } from "zustand";
import Cart, { CartGroup, CartItem } from "@/lib/classes/Cart";

const cartInstance = new Cart();

interface CartState {
  cart: CartGroup[];

  clearCart: () => void;
  addItem: (groupId: number, groupName: string, item: CartItem) => void;
  removeItem: (groupId: number, itemId: number) => void;
  deleteItem: (groupId: number, itemId: number) => void;
  deleteAll: () => void;
  reload: () => void;
  total: number;
  totalQty: number;

}

export const useCartStore = create<CartState>((set) => ({
  cart: [...cartInstance.getCart()],
  total: cartInstance.getTotal(),
  totalQty: cartInstance.getTotalQty(),

  clearCart: () => {
    cartInstance.clearCart();
    set({
      cart: [...cartInstance.getCart()],
      total: cartInstance.getTotal(),
      totalQty: cartInstance.getTotalQty(),
    });
  },

  addItem: (groupId, groupName, item) => {
    cartInstance.addItem(groupId, groupName, item);
    set({
      cart: [...cartInstance.getCart()],
      total: cartInstance.getTotal(),
      totalQty: cartInstance.getTotalQty(),
    });
  },

  removeItem: (groupId, itemId) => {
    cartInstance.removeItem(groupId, itemId);
    set({
      cart: [...cartInstance.getCart()],
      total: cartInstance.getTotal(),
      totalQty: cartInstance.getTotalQty(),
    });
  },

  deleteItem: (groupId, itemId) => {
    cartInstance.deleteItem(groupId, itemId);
    set({
      cart: [...cartInstance.getCart()],
      total: cartInstance.getTotal(),
      totalQty: cartInstance.getTotalQty(),
    });
  },

  deleteAll: () => {
    cartInstance.clearCart();
    set({
      cart: [],
      total: 0,
      totalQty: 0,
    });
  },

  reload: () => {
    cartInstance.loadCart();
    set({
      cart: [...cartInstance.getCart()],
      total: cartInstance.getTotal(),
      totalQty: cartInstance.getTotalQty(),
    });
  },
}));
