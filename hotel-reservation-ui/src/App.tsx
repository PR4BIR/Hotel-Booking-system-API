import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Reservations from './pages/Reservations';
import NewReservation from './pages/NewReservation';
import ReservationDetail from './pages/ReservationDetail';
import Payment from './pages/Payment';
import InvoiceViewer from './pages/InvoiceViewer';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import ReservationManagement from './pages/ReservationManagement';
import Rooms from './pages/Rooms';
import RoomDetails from './pages/RoomDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import ApiTest from './pages/ApiTest';
const App: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="unauthorized" element={<Unauthorized />} />
        <Route path="api-test" element={<ApiTest />} />
        {/* About and Contact pages */}
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        
        {/* Public room-related routes - view only */}
        <Route path="rooms" element={<Rooms />} />
        <Route path="rooms/:id" element={<RoomDetails />} />
        
        {/* Protected routes */}
        <Route path="new-reservation" element={
          <ProtectedRoute>
            <NewReservation />
          </ProtectedRoute>
        } />
        
        <Route path="dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="reservations" element={
          <ProtectedRoute>
            <Reservations />
          </ProtectedRoute>
        } />
        <Route path="reservations/new" element={
          <ProtectedRoute>
            <NewReservation />
          </ProtectedRoute>
        } />
        <Route path="reservations/:id" element={
          <ProtectedRoute>
            <ReservationDetail />
          </ProtectedRoute>
        } />
        <Route path="payment" element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        } />
        
        <Route path="invoice/:id" element={
          <ProtectedRoute>
            <InvoiceViewer />
          </ProtectedRoute>
        } />

        <Route path="admin/reservations" element={
          <ProtectedRoute requiredRole="admin">
            <ReservationManagement />
          </ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path="admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;