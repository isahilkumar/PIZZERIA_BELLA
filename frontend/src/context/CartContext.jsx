import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (newItem) => {
    setCartItems((prev) => {
      // Create a unique identifier based on ingredients
      const itemKey = newItem.itemType === 'custom'
        ? `custom_${newItem.base.id}_${newItem.sauce.id}_${newItem.cheese.id}_${(newItem.veggies || []).map(v => v.id).sort().join('_')}`
        : `variety_${newItem.pizzaVarietyId}`;

      const existingIndex = prev.findIndex((item) => item.key === itemKey);

      if (existingIndex > -1) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + (newItem.quantity || 1);
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          itemTotal: existing.unitPrice * newQty,
        };
        return updated;
      }

      return [
        ...prev,
        {
          ...newItem,
          key: itemKey,
          quantity: newItem.quantity || 1,
          itemTotal: newItem.unitPrice * (newItem.quantity || 1),
        },
      ];
    });
  };

  const removeFromCart = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, newQty) => {
    if (newQty <= 0) {
      removeFromCart(index);
      return;
    }
    setCartItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        quantity: newQty,
        itemTotal: updated[index].unitPrice * newQty,
      };
      return updated;
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.itemTotal, 0);
  const tax = Math.round(subtotal * 0.05);
  const deliveryFee = subtotal > 0 ? (subtotal >= 500 ? 0 : 40) : 0;
  const total = subtotal + tax + deliveryFee;
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        tax,
        deliveryFee,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

