import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

import './assets/styles/bootstrap-overrides.css';
import './assets/styles/main.css';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { Layout } from './components/layout/Layout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { AboutPage } from './pages/AboutPage';
import { BlogPage } from './pages/BlogPage';
import { ContactPage } from './pages/ContactPage';
import { CartPage } from './pages/CartPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { BlogDetailPage } from './pages/BlogDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthProvider } from './hooks/AuthProvider';
import { CartProvider } from './hooks/CartProvider';
import { NotificationProvider } from './hooks/NotificationProvider';
import { SearchProvider } from './hooks/SearchProvider';

import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { SellerDashboard } from './pages/seller/SellerDashboard';
import { SellerProductsPage } from './pages/seller/SellerProductsPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminBlogsPage } from './pages/admin/AdminBlogsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';

const router = createBrowserRouter([
  
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:productId', element: <ProductDetailPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'blog', element: <BlogPage /> },
      { path: 'blog/:blogId', element: <BlogDetailPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'profile', element: <ProfilePage /> },
        ],
      },
    ],
  },

  
  {
    path: '/admin',
    element: <ProtectedRoute allowedRoles={['ADMINISTRADOR']}><DashboardLayout role="ADMINISTRADOR" /></ProtectedRoute>,
    children: [
      { index: true, element: <AdminDashboard /> },
      
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'blogs', element: <AdminBlogsPage /> },
      { path: 'products', element: <AdminProductsPage /> },
      { path: 'categories', element: <AdminCategoriesPage /> },
      { path: 'reviews', element: <AdminReviewsPage /> },
      { path: 'orders', element: <AdminOrdersPage /> },
    ],
  },

  
  {
    path: '/seller',
    element: <ProtectedRoute allowedRoles={['VENDEDOR']}><DashboardLayout role="VENDEDOR" /></ProtectedRoute>,
    children: [
      { index: true, element: <SellerDashboard /> },
      { path: 'products', element: <SellerProductsPage /> },
      { path: 'orders', element: <div className="p-4"><h1>Gestión de Boletas</h1><p>Próximamente</p></div> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <SearchProvider>
            <RouterProvider router={router} />
          </SearchProvider>
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
);