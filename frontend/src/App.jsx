import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import WelcomePopup from './components/WelcomePopup.jsx';
import Home from './pages/Home.jsx';
import Menu from './pages/Menu.jsx';
import BookTable from './pages/BookTable.jsx';
import OrderFood from './pages/OrderFood.jsx';
import QueueStatus from './pages/QueueStatus.jsx';
import Login from './pages/Login.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import OrdersQueue from './admin/OrdersQueue.jsx';
import Dashboard from './admin/Dashboard.jsx';
import Bookings from './admin/Bookings.jsx';
import MenuManagement from './admin/MenuManagement.jsx';
import Customers from './admin/Customers.jsx';
import Analytics from './admin/Analytics.jsx';
import Settings from './admin/Settings.jsx';
import { useSession } from './context/SessionContext.jsx';

function SiteLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
      <WelcomePopup />
    </>
  );
}

function RequireAdmin({ children }) {
  const { isAdmin } = useSession();
  return isAdmin ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="menu" element={<Menu />} />
        <Route path="book" element={<BookTable />} />
        <Route path="order" element={<OrderFood />} />
        <Route path="queue/:id" element={<QueueStatus />} />
        <Route path="login" element={<Login />} />
      </Route>
      <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route index element={<Navigate to="orders" replace />} />
        <Route path="orders" element={<OrdersQueue />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="menu" element={<MenuManagement />} />
        <Route path="customers" element={<Customers />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
