import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopBar } from './components/Navigation/TopBar';
import { BottomNav } from './components/Navigation/BottomNav';
import { MenuPage } from './components/Customer/MenuPage';
import { CafeDiscovery } from './components/Customer/CafeDiscovery';
import { CartDrawer } from './components/Customer/CartDrawer';
import { OrderStatusTracker } from './components/Customer/OrderStatusTracker';
import { ReceiptModal } from './components/Customer/ReceiptModal';
import { ItemCustomizationModal } from './components/Customer/ItemCustomizationModal';
import { PaymentModal } from './components/Customer/PaymentModal';
import { ComplaintModal } from './components/Customer/ComplaintModal';
import { VoiceOrderModal } from './components/Customer/VoiceOrderModal';
import { QRScannerModal } from './components/Customer/QRScannerModal';
import { TableSelectorModal } from './components/Customer/TableSelectorModal';
import { AuthModal } from './components/Auth/AuthModal';
import { KitchenDisplaySystem } from './components/Staff/KitchenDisplaySystem';
import { StaffDashboard } from './components/Staff/StaffDashboard';
import { AnalyticsDashboard } from './components/Staff/AnalyticsDashboard';
import { MenuManagement } from './components/Staff/MenuManagement';
import { ComplaintsManagement } from './components/Staff/ComplaintsManagement';
import { Mic, Clock, Sparkles } from 'lucide-react';

function AppContent() {
  const {
    activeView,
    setActiveView,
    activeOrderId,
    setIsVoiceModalOpen,
    toastMessage,
    isChef,
    isCustomer
  } = useApp();

  const isStaffView = [
    'kds',
    'staff_dashboard',
    'order_management',
    'analytics',
    'complaints',
    'menu_management'
  ].includes(activeView);

  const renderMainContent = () => {
    // 1. Chef: strictly allowed to view Kitchen Requests (KDS)
    if (isChef) {
      return <KitchenDisplaySystem />;
    }

    // 2. Normal customer / guest attempting to view staff view: gracefully default to menu
    if (isCustomer && isStaffView) {
      return <MenuPage />;
    }

    // 3. Render specific active view
    switch (activeView) {
      case 'menu':
        return <MenuPage />;
      case 'discovery':
        return <CafeDiscovery />;
      case 'cart':
        return <CartDrawer />;
      case 'order_status':
        return <OrderStatusTracker />;
      case 'receipt':
        return <ReceiptModal />;
      case 'kds':
        return <KitchenDisplaySystem />;
      case 'staff_dashboard':
        return <StaffDashboard />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'complaints':
        return <ComplaintsManagement />;
      case 'menu_management':
        return <MenuManagement />;
      default:
        // Guaranteed fallback to MenuPage so it NEVER leaves an empty or blank screen
        return <MenuPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans transition-colors duration-300 antialiased selection:bg-[var(--primary)] selection:text-[var(--primary-foreground)]">
      {/* Navigation Header */}
      <TopBar />

      {/* Main Viewport Container */}
      <main className="flex-1 pb-24 md:pb-12">
        {renderMainContent()}
      </main>

      {/* Customer Floating Quick-Access Bar (Hidden for Staff & Chef Views) */}
      {!isStaffView && !isChef && (
        <div className="fixed bottom-16 md:bottom-6 right-4 sm:right-8 z-40 flex items-center gap-3">
          {/* Active order badge button if active order */}
          {activeOrderId && activeView !== 'order_status' && (
            <button
              onClick={() => setActiveView('order_status')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold transition-all transform hover:scale-105 active:scale-95"
            >
              <Clock className="w-4 h-4 animate-spin text-emerald-200" />
              <span>Track Live Order</span>
            </button>
          )}

          {/* Voice Order Assistant Floating Trigger Button */}
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="group relative flex items-center gap-2 py-3 px-4 rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 text-xs font-bold"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-foreground)'
            }}
          >
            <div className="relative">
              <Mic className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span className="hidden sm:inline">Voice Order</span>
          </button>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Modals and Dialog Overlays */}
      <ItemCustomizationModal />
      <PaymentModal />
      <ComplaintModal />
      <VoiceOrderModal />
      <QRScannerModal />
      <TableSelectorModal />
      <AuthModal />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[var(--card)] text-[var(--card-foreground)] px-4 py-2.5 rounded-2xl border border-[var(--border)] shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-2 duration-200">
          <Sparkles className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
