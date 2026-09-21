import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set) => ({
      cart: [],

      shippingMethod: 'inside',

      addToCart: (product) => set((state) => {

        const productId =
          product._id ||
          product.id;

        const customization =
          product.customization || {};

        const cartItemId =
          product.cartItemId ||
          [
            productId,
            product.selectedColor || '',
            product.selectedSize || '',
            product.productNote || '',
            customization.length || '',
            customization.height || '',
            customization.width || '',
          ].join('-');

        const existingItem =
          state.cart.find(
            (item) =>
              item.cartItemId === cartItemId
          );

        if (existingItem) {

          return {
            cart: state.cart.map(
              (item) =>
                item.cartItemId === cartItemId
                  ? {
                      ...item,
                      quantity:
                        item.quantity +
                        (product.quantity || 1),
                    }
                  : item
            ),
          };

        }

        return {
          cart: [
            ...state.cart,
            {
              ...product,
              id: productId,
              cartItemId,
              quantity:
                product.quantity || 1,
            },
          ],
        };

      }),

      removeFromCart: (cartItemId) =>
        set((state) => ({
          cart: state.cart.filter(
            (item) =>
              item.cartItemId !== cartItemId &&
              (item._id || item.id) !== cartItemId
          ),
        })),

      updateQuantity: (
        cartItemId,
        quantity
      ) =>
        set((state) => ({
          cart: state.cart.map(
            (item) =>
              (
                item.cartItemId === cartItemId ||
                (item._id || item.id) === cartItemId
              )
                ? {
                    ...item,
                    quantity:
                      Math.max(
                        1,
                        quantity
                      ),
                  }
                : item
          ),
        })),

      setShippingMethod: (method) =>
        set({
          shippingMethod: method,
        }),

      clearCart: () =>
        set({
          cart: [],
        }),
    }),

    {
      name: 'classybazar-shopping-cart',
    }
  )
);