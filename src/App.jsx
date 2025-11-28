import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Quote from './pages/Quote';
import Tracking from './pages/Tracking';
import Shipments from './pages/Shipments';
import CreateShipment from './pages/CreateShipment';
import ShipmentDetail from './pages/ShipmentDetail';
import Profile from './pages/Profile';
import Documents from './pages/Documents';
import Transactions from './pages/Transactions';
import TransactionDetail from './pages/TransactionDetail';

// Payment pages
import PaymentMethodSelection from './pages/payment/PaymentMethodSelection';
import PaymentConfirmation from './pages/payment/PaymentConfirmation';
import PaymentProcessor from './pages/payment/PaymentProcessor';
import PaymentSuccess from './pages/payment/PaymentSuccess';
import PaymentFailed from './pages/payment/PaymentFailed';
import CheckoutExpired from './pages/payment/CheckoutExpired';
import PaymentUploadSuccess from './pages/payment/PaymentUploadSuccess';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes with layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quote"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Quote />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tracking"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Tracking />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shipments"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Shipments />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shipments/create"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CreateShipment />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shipments/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ShipmentDetail />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Documents />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Transactions />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TransactionDetail />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Payment routes */}
          <Route
            path="/shipments/:shipment_id/payment/select-method"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PaymentMethodSelection />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shipments/:shipment_id/payment/confirm"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PaymentConfirmation />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shipments/:shipment_id/payment/process"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PaymentProcessor />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shipments/:shipment_id/payment/success"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PaymentSuccess />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shipments/:shipment_id/payment/failed"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PaymentFailed />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shipments/:shipment_id/payment/expired"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CheckoutExpired />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shipments/:shipment_id/payment/upload-success"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PaymentUploadSuccess />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
