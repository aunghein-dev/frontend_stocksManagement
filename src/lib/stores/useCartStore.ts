import { create } from 'zustand';
import Cart, { CartGroup, CartItem, Stock } from '@/lib/classes/Cart';

interface CartState {
  cartInstance: Cart; // This holds the single instance of  Cart class
  cart: CartGroup[]; // Mirrored cart state for reactivity
  total: number;     // Mirrored total for reactivity
  totalQty: number;  // Mirrored total quantity for reactivity

  // Actions that components will call, delegating to the cartInstance
  addItem: (groupId: number, groupName: string, newItem: CartItem) => void;
  addItemByBarcode: (barcode: string, allAvailableStocks: Stock[]) => boolean;
  removeItem: (groupId: number, itemId: number) => void;
  deleteItem: (groupId: number, itemId: number) => void;
  clearCart: () => void;

  // Internal helper action to sync Zustand's state with the Cart instance
  _syncCartState: () => void;
}
export const useCartStore = create<CartState>((set) => {
  const cartInstance = new Cart();

const _syncCartState = () => {
  set({
    cart: [...cartInstance.getCart()], // <-- force new array reference
    total: cartInstance.getTotal(),
    totalQty: cartInstance.getTotalQty(),
  });
};


  return {
    cartInstance,
    cart: cartInstance.getCart(),
    total: cartInstance.getTotal(),
    totalQty: cartInstance.getTotalQty(),

    addItem: (groupId, groupName, newItem) => {
      cartInstance.addItem(groupId, groupName, newItem);
      _syncCartState();
    },
    addItemByBarcode: (barcode, allStocks) => {
      const success = cartInstance.addItemByBarcode(barcode, allStocks);
      _syncCartState();
      return success;
    },
    removeItem: (groupId, itemId) => {
      cartInstance.removeItem(groupId, itemId);
      _syncCartState();
    },
    deleteItem: (groupId, itemId) => {
      cartInstance.deleteItem(groupId, itemId);
      _syncCartState();
    },
    clearCart: () => {
      cartInstance.clearCart();
      _syncCartState();
    },

    _syncCartState,
  };
});
