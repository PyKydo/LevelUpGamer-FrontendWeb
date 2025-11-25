import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CartContext } from './CartContext';
import type { CartContextType, CartItem, CartProviderProps } from './CartContext';
import { useAuth } from './useAuth';
import {
  addProductToCartApi,
  clearUserCartApi,
  fetchUserCart,
  getProductByBackendId,
  removeProductFromCartApi,
  setCartItemQuantityApi,
} from '../helpers/api.helper';
import {
  getLocalStorageItem,
  removeLocalStorageItem,
  setLocalStorageItem,
} from '../helpers/storage.helper';

const isPlaceholderImage = (src?: string) => !src || src.includes('placehold');
const LOCAL_CART_STORAGE_KEY = 'levelupgamer_local_cart';

// Local cart fallback when there is no authenticated user
const readLocalCart = (): CartItem[] =>
  getLocalStorageItem<CartItem[]>(LOCAL_CART_STORAGE_KEY, []) ?? [];

const persistLocalCart = (items: CartItem[]): void => {
  if (!items.length) {
    removeLocalStorageItem(LOCAL_CART_STORAGE_KEY);
    return;
  }
  setLocalStorageItem(LOCAL_CART_STORAGE_KEY, items);
};

const clearLocalCartStorage = () => removeLocalStorageItem(LOCAL_CART_STORAGE_KEY);

export const CartProvider = ({ children }: CartProviderProps) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const imageCache = useRef<Record<number, string>>({});

  const enrichCartImages = useCallback(async (items: CartItem[]): Promise<CartItem[]> => {
    if (!items.length) {
      return items;
    }

    const normalized = items.map((item) => {
      const cached = imageCache.current[item.productId];
      if (!cached && !isPlaceholderImage(item.image)) {
        imageCache.current[item.productId] = item.image;
        return item;
      }

      if (!item.image || isPlaceholderImage(item.image)) {
        if (cached) {
          return { ...item, image: cached };
        }
      }

      return item;
    });

    const pending = normalized.filter((item) => isPlaceholderImage(item.image));

    if (!pending.length) {
      return normalized;
    }

    const fetchedImages = await Promise.all(
      pending.map(async (item) => {
        const product = await getProductByBackendId(item.productId);
        if (product?.image) {
          return { productId: item.productId, image: product.image };
        }
        return null;
      })
    );

    fetchedImages.forEach((entry) => {
      if (entry) {
        imageCache.current[entry.productId] = entry.image;
      }
    });

    return normalized.map((item) => {
      const override = imageCache.current[item.productId];
      return override ? { ...item, image: override } : item;
    });
  }, []);

  const refreshCart = useCallback(async () => {
    if (!user?.id) {
      const localItems = readLocalCart();
      setCart(localItems);
      return;
    }

    setLoading(true);
    try {
      const items = await fetchUserCart(user.id, imageCache.current);
      const enriched = await enrichCartImages(items);
      setCart(enriched);
    } catch (error) {
      console.error('No se pudo cargar el carrito:', error);
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [enrichCartImages, user?.id]);

  const syncLocalCartWithBackend = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    const localItems = readLocalCart();
    if (!localItems.length) {
      return;
    }

    try {
      localItems.forEach((item) => {
        if (item.productId && item.image && !isPlaceholderImage(item.image)) {
          imageCache.current[item.productId] = item.image;
        }
      });

      for (const item of localItems) {
        await addProductToCartApi(
          user.id,
          item.productId,
          item.quantity,
          imageCache.current
        );
      }

      clearLocalCartStorage();
    } catch (error) {
      console.error('No se pudo sincronizar el carrito local con el backend:', error);
    }
  }, [imageCache, user?.id]);

  useEffect(() => {
    const bootstrapCart = async () => {
      if (user?.id) {
        await syncLocalCartWithBackend();
      }
      await refreshCart();
    };

    void bootstrapCart();
  }, [refreshCart, syncLocalCartWithBackend, user?.id]);

  const guardUserId = () => user?.id ?? null;

  const updateCartFromOperation = useCallback(async (operation: () => Promise<CartItem[]>) => {
    try {
      const items = await operation();
      const enriched = await enrichCartImages(items);
      setCart(enriched);
    } catch (error) {
      console.error('No se pudo actualizar el carrito:', error);
    }
  }, [enrichCartImages]);

  const addToCart: CartContextType['addToCart'] = async (item, quantity = 1) => {
    const userId = guardUserId();
    if (!userId) {
      if (item.productId && item.image && !isPlaceholderImage(item.image)) {
        imageCache.current[item.productId] = item.image;
      }
      setCart((current) => {
        const existing = current.find((cartItem) => cartItem.productId === item.productId);
        const updated = existing
          ? current.map((cartItem) =>
              cartItem.productId === item.productId
                ? { ...cartItem, quantity: cartItem.quantity + quantity }
                : cartItem
            )
          : [
              ...current,
              {
                ...item,
                id:
                  item.id ??
                  item.productId?.toString() ??
                  globalThis.crypto?.randomUUID?.() ??
                  `temp-cart-${Date.now()}-${Math.random()}`,
                quantity,
              },
            ];
        persistLocalCart(updated);
        return updated;
      });
      return;
    }
    if (item.productId) {
      imageCache.current[item.productId] = item.image;
    }
    await updateCartFromOperation(() =>
      addProductToCartApi(userId, item.productId, quantity, imageCache.current)
    );
  };

  const removeFromCart: CartContextType['removeFromCart'] = async (productId) => {
    const userId = guardUserId();
    if (!userId) {
      setCart((current) => {
        const updated = current.filter((item) => item.productId !== productId);
        persistLocalCart(updated);
        return updated;
      });
      return;
    }

    await updateCartFromOperation(() =>
      removeProductFromCartApi(userId, productId, imageCache.current)
    );
  };

  const increaseQuantity: CartContextType['increaseQuantity'] = async (productId) => {
    const userId = guardUserId();
    if (!userId) {
      setCart((current) => {
        const updated = current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        persistLocalCart(updated);
        return updated;
      });
      return;
    }

    await updateCartFromOperation(() =>
      addProductToCartApi(userId, productId, 1, imageCache.current)
    );
  };

  const decreaseQuantity: CartContextType['decreaseQuantity'] = async (productId) => {
    const userId = guardUserId();
    if (!userId) {
      setCart((current) => {
        const updated = current
          .map((item) =>
            item.productId === productId
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          .filter((item) => item.quantity > 0);
        persistLocalCart(updated);
        return updated;
      });
      return;
    }

    const existing = cart.find((item) => item.productId === productId);
    if (!existing) {
      return;
    }

    if (existing.quantity <= 1) {
      await removeFromCart(productId);
      return;
    }

    await updateCartFromOperation(() =>
      setCartItemQuantityApi(
        userId,
        productId,
        existing.quantity - 1,
        imageCache.current
      )
    );
  };

  const clearCart: CartContextType['clearCart'] = async () => {
    const userId = guardUserId();
    if (!userId) {
      setCart([]);
      clearLocalCartStorage();
      return;
    }

    try {
      await clearUserCartApi(userId);
      setCart([]);
    } catch (error) {
      console.error('No se pudo limpiar el carrito:', error);
    }
  };

  const totalItems = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  );

  const contextValue: CartContextType = {
    cart,
    loading,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    refreshCart,
    totalItems,
  };

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};