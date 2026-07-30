import { Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import ToolPage from "./pages/ToolPage.jsx";
import Pricing from "./pages/Pricing.jsx";
import SearchResults from "./pages/SearchResults.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NotFound from "./pages/NotFound.jsx";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute.jsx";

import AdminLayout from "./pages/admin/AdminLayout.jsx";
import Overview from "./pages/admin/Overview.jsx";
import Users from "./pages/admin/Users.jsx";
import Subscriptions from "./pages/admin/Subscriptions.jsx";
import Payments from "./pages/admin/Payments.jsx";
import ContentTools from "./pages/admin/ContentTools.jsx";
import ContentQuestions from "./pages/admin/ContentQuestions.jsx";

function PublicLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Overview />} />
          <Route path="users" element={<Users />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="payments" element={<Payments />} />
          <Route path="tools" element={<ContentTools />} />
          <Route path="questions" element={<ContentQuestions />} />
        </Route>
      </Route>

      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/tools/:toolSlug/:categorySlug" element={<ToolPage />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
