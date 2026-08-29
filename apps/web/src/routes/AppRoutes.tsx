import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "../pages/login";
import Dashboard from "../pages/admin/Dashboard";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";

export default function AppRoutes() {

  return (
    <Routes>

      <Route
        path="/login"
        element={<Login />}
      />

      <Route element={<ProtectedRoute />}>

        <Route
          path="/admin"
          element={<AdminLayout />}
        >

          <Route
            path="dashboard"
            element={<Dashboard />}
          />

        </Route>

      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/admin/dashboard"
            replace
          />
        }
      />

    </Routes>
  );
}