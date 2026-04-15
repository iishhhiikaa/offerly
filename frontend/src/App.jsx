import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './modules/customer/context/AppContext';
import AppLayout from './modules/customer/components/layout/AppLayout';

// Auth pages
import CustomerLogin from './modules/customer/pages/auth/CustomerLogin';
import CustomerSignup from './modules/customer/pages/auth/CustomerSignup';
import OtpVerify from './modules/customer/pages/auth/OtpVerify';

// Core pages
import Home from './modules/customer/pages/home/Home';
import Explore from './modules/customer/pages/explore/Explore';
import MapView from './modules/customer/pages/explore/MapView';
import OfferDetail from './modules/customer/pages/offers/OfferDetail';
import SavedOffers from './modules/customer/pages/offers/SavedOffers';
import MyRedemptions from './modules/customer/pages/offers/MyRedemptions';
import QrScreen from './modules/customer/pages/redemption/QrScreen';
import LeaveReview from './modules/customer/pages/redemption/LeaveReview';
import StoreProfile from './modules/customer/pages/store/StoreProfile';
import Profile from './modules/customer/pages/profile/Profile';
import Referral from './modules/customer/pages/profile/Referral';
import Notifications from './modules/customer/pages/profile/Notifications';
import SearchResults from './modules/customer/pages/search/SearchResults';
import CartView from './modules/customer/pages/redemption/CartView';

// Business & Platform modules
import MerchantApp from './modules/merchant/MerchantApp';
import AdminApp from './modules/admin/AdminApp';

const AppRoutes = () => {
  // Protected route wrapper - defined inside AppRoutes to ensure it's within AppProvider
  const ProtectedRoute = ({ children }) => {
    const { isLoggedIn } = useApp();
    return isLoggedIn ? children : <Navigate to="/login" replace />;
  };

  return (
    <Routes>
      {/* Merchant Panel - Independent Layout */}
      <Route path="/merchant/*" element={<MerchantApp />} />
      
      {/* Admin Panel - Independent Layout */}
      <Route path="/admin/*" element={<AdminApp />} />

      {/* Customer Auth Routes - WITHOUT AppLayout (no navbar/sidebar) */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<CustomerLogin />} />
      <Route path="/signup" element={<CustomerSignup />} />
      <Route path="/verify" element={<OtpVerify />} />

      {/* Customer App - Protected routes WITH AppLayout */}
      <Route path="/*" element={
        <AppLayout>
          <Routes>
            <Route path="home" element={<Home />} />
            <Route path="explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
            <Route path="map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />
            <Route path="cart" element={<ProtectedRoute><CartView /></ProtectedRoute>} />
            <Route path="offer/:id" element={<ProtectedRoute><OfferDetail /></ProtectedRoute>} />
            <Route path="saved" element={<ProtectedRoute><SavedOffers /></ProtectedRoute>} />
            <Route path="redemptions" element={<ProtectedRoute><MyRedemptions /></ProtectedRoute>} />
            <Route path="redeem/:id" element={<ProtectedRoute><QrScreen /></ProtectedRoute>} />
            <Route path="review/:id" element={<ProtectedRoute><LeaveReview /></ProtectedRoute>} />
            <Route path="store/:id" element={<ProtectedRoute><StoreProfile /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="referral" element={<ProtectedRoute><Referral /></ProtectedRoute>} />
            <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="search" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />

            {/* Catch-all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AppLayout>
      } />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AppProvider>
      <AppRoutes />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500,
          style: {
            background: '#1A1A1A',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 500,
          },
          success: {
            iconTheme: { primary: '#3D7A4F', secondary: '#fff' },
          },
        }}
      />
    </AppProvider>
  </BrowserRouter>
);

export default App;
