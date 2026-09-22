import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { RoomDetailPage } from './pages/public/RoomDetailPage';
import { PropertyDetailPage } from './pages/public/PropertyDetailPage';
import { BookingConfirmationPage } from './pages/public/BookingConfirmationPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Dashboard Management Pages
import { Dashboard } from './pages/Dashboard';
import { PropertiesPage } from './pages/PropertiesPage';
import { RoomTypesPage } from './pages/RoomTypesPage';
import { RoomsPage } from './pages/RoomsPage';
import { BookingsPage } from './pages/BookingsPage';
import { GuestsPage } from './pages/GuestsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { ReportsPage } from './pages/ReportsPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0f382c',
              color: '#fcfbfa',
              border: '1px solid #c5a059',
              fontSize: '13px',
              borderRadius: '12px',
            },
          }}
        />
        <Routes>
          {/* Public Hotel Website */}
          <Route path="/" element={<HomePage />} />
          <Route path="/rooms/:id" element={<RoomDetailPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/booking-confirmation/:id" element={<BookingConfirmationPage />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Management Dashboard (Protected) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="rooms" element={<RoomsPage />} />
              <Route path="properties" element={<PropertiesPage />} />
              <Route path="room-types" element={<RoomTypesPage />} />
              <Route path="guests" element={<GuestsPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="reviews" element={<ReviewsPage />} />

              {/* Reports - Restricted to Owner/Manager */}
              <Route
                element={<ProtectedRoute requiredRoles={['owner', 'manager']} />}
              >
                <Route path="reports" element={<ReportsPage />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
