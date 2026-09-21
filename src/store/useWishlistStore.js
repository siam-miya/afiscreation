import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWishlistStore = create(
  persist(
    (set) => ({
      wishlist: [],
      
      toggleWishlist: (product) => set((state) => {
        const productId = product._id || product.id;
        const exists = state.wishlist.find((item) => (item._id || item.id) === productId);
        
        if (exists) {
          return { wishlist: state.wishlist.filter((item) => (item._id || item.id) !== productId) };
        }
        return { wishlist: [...state.wishlist, product] };
      }),

      clearWishlist: () => set({ wishlist: [] }),
    }),
    {
      name: 'classy-wishlist', 
    }
  )
);