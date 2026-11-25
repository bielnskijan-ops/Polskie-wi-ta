import { useCallback, useEffect, useState } from 'react';
import { AccountModal } from './components/AccountModal';
import { AuthModal, type AuthMode } from './components/AuthModal';
import { CartDrawer } from './components/CartDrawer';
import { CatalogSection } from './components/CatalogSection';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { InfoSection } from './components/InfoSection';
import { ProductDetailView } from './components/ProductDetailView';
import { SimulationConfirmationModal } from './components/SimulationConfirmationModal';
import { CATALOG_PRODUCTS } from './data/catalog';
import { supabase } from './lib/supabase';
import {
  createAuthenticatedOrder,
  fetchUserOrders,
  logoutSession,
  mapSupabaseUser,
} from './services/authService';
import { fetchCatalog } from './services/catalogService';
import {
  AuthUser,
  CartItem,
  DeliveryMethod,
  Product,
  ProductCategory,
  SimulationOrder,
} from './types/shop';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState<boolean>(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'Wszystkie'>(
    'Wszystkie'
  );

  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [confirmedOrder, setConfirmedOrder] = useState<SimulationOrder | null>(null);

  // Stan uwierzytelnienia utrzymywany wyłącznie w pamięci aplikacji (bez localStorage)
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<AuthMode>('login');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [userOrders, setUserOrders] = useState<SimulationOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [returnToCartAfterAuth, setReturnToCartAfterAuth] = useState<boolean>(false);

  const loadCatalog = useCallback(async (category: ProductCategory | 'Wszystkie') => {
    setIsLoadingCatalog(true);
    setCatalogError(null);
    try {
      const data = await fetchCatalog({ category });
      setProducts(data);
    } catch {
      setCatalogError('Nie udało się pobrać katalogu produktów.');
    } finally {
      setIsLoadingCatalog(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog(selectedCategory);
  }, [selectedCategory, loadCatalog]);

  const loadOrders = useCallback(async (token: string) => {
    setIsLoadingOrders(true);
    try {
      const orders = await fetchUserOrders(token);
      setUserOrders(orders);
    } catch {
      setUserOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;

    void supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (session?.user) {
        setAuthToken(session.access_token);
        setCurrentUser(mapSupabaseUser(session.user));
        void loadOrders(session.access_token);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthToken(session.access_token);
        setCurrentUser(mapSupabaseUser(session.user));
        void loadOrders(session.access_token);
      } else {
        setAuthToken(null);
        setCurrentUser(null);
        setUserOrders([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadOrders]);

  const handleAuthSuccess = (token: string, user: AuthUser) => {
    setAuthToken(token);
    setCurrentUser(user);
    setOrderError(null);
    void loadOrders(token);
    if (returnToCartAfterAuth) {
      setReturnToCartAfterAuth(false);
      setIsCartOpen(true);
    }
  };

  const handleLogout = () => {
    const tokenToRevoke = authToken;
    setAuthToken(null);
    setCurrentUser(null);
    setUserOrders([]);
    setIsAccountModalOpen(false);
    void logoutSession(tokenToRevoke);
  };

  const handleOpenAuth = (mode: AuthMode, fromCart = false) => {
    setReturnToCartAfterAuth(fromCart);
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (product: Product, variant?: string, quantity = 1) => {
    const resolvedVariant = variant ?? product.variants[0] ?? 'Standard';
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.variant === resolvedVariant
      );
      if (existingIndex === -1) {
        return [...prev, { product, variant: resolvedVariant, quantity }];
      }
      return prev.map((item, index) => {
        if (index !== existingIndex) return item;
        const nextQty = Math.min(product.stock, item.quantity + quantity);
        return { ...item, quantity: nextQty };
      });
    });
  };

  const handleUpdateQuantity = (
    productId: string,
    variant: string,
    newQuantity: number
  ) => {
    setOrderError(null);
    if (newQuantity <= 0) {
      handleRemoveItem(productId, variant);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.variant === variant
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const handleRemoveItem = (productId: string, variant: string) => {
    setOrderError(null);
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.variant === variant)
      )
    );
  };

  const handleClearCart = () => {
    setOrderError(null);
    setCartItems([]);
  };

  const handleConfirmSimulation = async (
    customerName: string,
    deliveryMethod: DeliveryMethod
  ) => {
    setOrderError(null);

    if (!authToken || !currentUser) {
      setOrderError('Zaloguj się lub utwórz konto, aby złożyć zamówienie.');
      setIsCartOpen(false);
      handleOpenAuth('login', true);
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const savedOrder = await createAuthenticatedOrder(authToken, {
        customerName,
        deliveryMethodId: deliveryMethod.id,
        items: cartItems,
      });
      setUserOrders((prev) => [savedOrder, ...prev]);
      setCartItems([]);
      setIsCartOpen(false);
      setConfirmedOrder(savedOrder);
    } catch (err) {
      setOrderError(
        err instanceof Error
          ? err.message
          : 'Nie udało się zapisać symulowanego zamówienia.'
      );
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleStartNewSimulation = () => {
    setCartItems([]);
    setConfirmedOrder(null);
    setActiveProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product: Product) => {
    setActiveProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToSection = (sectionId: string) => {
    if (activeProduct) {
      setActiveProduct(null);
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
      return;
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const relatedSource = products.length > 0 ? products : CATALOG_PRODUCTS;
  const relatedProducts = activeProduct
    ? relatedSource.filter((item) => item.id !== activeProduct.id)
    : [];

  return (
    <div className="min-h-screen flex flex-col festive-backdrop text-[#FFFBEB]">
      <Header
        cartItemCount={totalCartCount}
        currentUser={currentUser}
        onOpenCart={() => {
          setOrderError(null);
          setIsCartOpen(true);
        }}
        onOpenAuth={handleOpenAuth}
        onOpenAccount={() => {
          if (authToken) {
            void loadOrders(authToken);
          }
          setIsAccountModalOpen(true);
        }}
        onNavigateHome={() => {
          setActiveProduct(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onScrollToSection={handleScrollToSection}
      />

      <main className="flex-1">
        {activeProduct ? (
          <ProductDetailView
            product={activeProduct}
            relatedProducts={relatedProducts}
            onBackToCatalog={() => setActiveProduct(null)}
            onAddToCart={handleAddToCart}
            onSelectProduct={handleSelectProduct}
          />
        ) : (
          <>
            <HeroSection
              onBrowseCatalog={() => handleScrollToSection('katalog')}
            />
            <CatalogSection
              products={products}
              isLoading={isLoadingCatalog}
              errorMessage={catalogError}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onRetryFetch={() => void loadCatalog(selectedCategory)}
              onSelectProduct={handleSelectProduct}
              onQuickAddToCart={(product) => handleAddToCart(product)}
            />
            <InfoSection />
          </>
        )}
      </main>

      <footer className="border-t-2 border-[#FBBF24] festive-header-kitsch backdrop-blur-md text-[#FDE68A] shadow-[0_-6px_24px_rgba(245,158,11,0.25)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span className="font-display text-sm font-bold kitsch-gold-text">
            Polskie Święta · Świąteczny symulator sklepu
          </span>
          <span>Katalog i zamówienia chronione przez Supabase Auth + RLS</span>
        </div>
        <div className="h-2 w-full festive-lights-strip border-t border-[#FBBF24]/50" aria-hidden="true" />
      </footer>

      <CartDrawer
        isOpen={isCartOpen}
        items={cartItems}
        currentUser={currentUser}
        isSubmittingOrder={isSubmittingOrder}
        orderError={orderError}
        onClose={() => setIsCartOpen(false)}
        onOpenAuth={(mode) => {
          setIsCartOpen(false);
          handleOpenAuth(mode, true);
        }}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onConfirmSimulation={handleConfirmSimulation}
      />

      <SimulationConfirmationModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onStartNewSimulation={handleStartNewSimulation}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => {
          setReturnToCartAfterAuth(false);
          setIsAuthModalOpen(false);
        }}
        onAuthSuccess={handleAuthSuccess}
      />

      <AccountModal
        isOpen={isAccountModalOpen}
        user={currentUser}
        orders={userOrders}
        isLoadingOrders={isLoadingOrders}
        onClose={() => setIsAccountModalOpen(false)}
        onLogout={handleLogout}
        onSelectOrderReceipt={(order) => setConfirmedOrder(order)}
      />
    </div>
  );
}
