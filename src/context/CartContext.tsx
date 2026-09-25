'use client';

/**
 * @file CartContext.tsx
 * @description React Context managing the customer's trade shopping cart.
 * Synchronizes with the backend persistent cart API (/api/cart) when authenticated.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

export interface CartProduct {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  imageUrl?: string | null;
  stockStatus: string;
  category?: {
    name: string;
    slug: string;
    placeholderImage?: string;
  };
}

export interface CartItem {
  _id: string;
  product: CartProduct;
  quantity: number;
  priceAtAdd: number;
  unitPrice: number;
  lineTotal: number;
}

interface CartContextType {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<{ success: boolean; message?: string }>;
  updateQuantity: (itemId: string, quantity: number) => Promise<{ success: boolean; message?: string }>;
  removeFromCart: (itemId: string) => Promise<{ success: boolean; message?: string }>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Cart Context Provider component.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [itemCount, setItemCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * Fetches latest cart state from server API.
   */
  const refreshCart = useCallback(async (): Promise<void> => {
    // Only attempt to load cart if user is authenticated
    if (!isAuthenticated) {
      setItems([]);
      setSubtotal(0);
      setItemCount(0);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.cart) {
          setItems(data.cart.items || []);
          setSubtotal(data.cart.subtotal || 0);
          setItemCount(data.cart.itemCount || 0);
        }
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Refresh cart when auth state changes
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  /**
   * Adds product to cart via API.
   */
  const addToCart = async (
    productId: string,
    quantity: number = 1
  ): Promise<{ success: boolean; message?: string }> => {
    if (!isAuthenticated) {
      return { success: false, message: 'Please login to add items to your cart' };
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await refreshCart();
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Failed to add item' };
      }
    } catch {
      return { success: false, message: 'Network error adding to cart' };
    }
  };

  /**
   * Updates an item's quantity in the cart.
   */
  const updateQuantity = async (
    itemId: string,
    quantity: number
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await refreshCart();
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Failed to update quantity' };
      }
    } catch {
      return { success: false, message: 'Network error updating quantity' };
    }
  };

  /**
   * Removes an item from the cart.
   */
  const removeFromCart = async (
    itemId: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await refreshCart();
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Failed to remove item' };
      }
    } catch {
      return { success: false, message: 'Network error removing item' };
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        itemCount,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/**
 * Hook to consume CartContext.
 */
export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
