import { Navigate, Route, Routes } from "react-router-dom";
import { AuthGuard } from "../components/AuthGuard";
import { AdminLayout } from "../layouts/AdminLayout";
import AdminAnalyticsPage from "../pages/AdminAnalyticsPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import AdminLoginPage from "../pages/AdminLoginPage";
import AdminMenuPage from "../pages/AdminMenuPage";
import MenuPage from "../pages/MenuPage";
import NotFoundPage from "../pages/NotFoundPage";
import OrderSuccessPage from "../pages/OrderSuccessPage";

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/admin/login" replace />} />
    <Route path="/menu/:tableId" element={<MenuPage />} />
    <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
    <Route path="/admin/login" element={<AdminLoginPage />} />
    <Route element={<AuthGuard />}>
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<Navigate to="/admin/orders" replace />} />
        <Route path="/admin/orders" element={<AdminDashboardPage />} />
        <Route path="/admin/menu" element={<AdminMenuPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
      </Route>
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRouter;
