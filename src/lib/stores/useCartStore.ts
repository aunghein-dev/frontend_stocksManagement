import { create } from 'zustand';
import Cart, { CartGroup, CartItem, Stock } from '@/lib/classes/Cart';

interface CartState {
  cartInstance: Cart; // This holds the single instance of your Cart class
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

export const useCartStore = create<CartState>((set, get) => {
  const cartInstance = new Cart(); // Create the single instance of your Cart class

  // Helper function to update Zustand's `cart`, `total`, `totalQty`
  // after any operation on `cartInstance`.
  const _syncCartState = () => {
    set({
      cart: cartInstance.getCart(),
      total: cartInstance.getTotal(),
      totalQty: cartInstance.getTotalQty(),
    });
  };

  // Initial state setup: Load cart and sync Zustand state
  cartInstance.loadCart(); // Load cart from localStorage
  _syncCartState();        // Initialize Zustand state with loaded cart data

  return {
    cartInstance,

    // Expose mirrored state properties for direct consumption by components
    cart: cartInstance.getCart(), // Initial cart state
    total: cartInstance.getTotal(), // Initial total
    totalQty: cartInstance.getTotalQty(), // Initial total quantity

    // Define actions that delegate to the cartInstance and then sync Zustand state
    addItem: (groupId, groupName, newItem) => {
      cartInstance.addItem(groupId, groupName, newItem);
      get()._syncCartState(); // <--- CRUCIAL: Update Zustand state
    },
    addItemByBarcode: (barcode, allAvailableStocks) => {
      const success = cartInstance.addItemByBarcode(barcode, allAvailableStocks);
      get()._syncCartState(); // <--- CRUCIAL: Update Zustand state
      return success;
    },
    removeItem: (groupId, itemId) => {
      cartInstance.removeItem(groupId, itemId);
      get()._syncCartState(); // <--- CRUCIAL: Update Zustand state
    },
    deleteItem: (groupId, itemId) => {
      cartInstance.deleteItem(groupId, itemId);
      get()._syncCartState(); // <--- CRUCIAL: Update Zustand state
    },
    clearCart: () => {
      cartInstance.clearCart();
      get()._syncCartState(); // <--- CRUCIAL: Update Zustand state
    },

    _syncCartState,
  };
});