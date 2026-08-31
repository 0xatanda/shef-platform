import { Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/auth/Login";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";

import Dashboard from "../pages/admin/Dashboard";
import Projects from "../pages/admin/Projects";
import Publications from "../pages/admin/Publications";
import Partners from "../pages/admin/Partners";
import Team from "../pages/admin/Team";
import Testimonials from "../pages/admin/Testimonials";
import Media from "../pages/admin/Media";
import Contacts from "../pages/admin/Contacts";
import Donations from "../pages/admin/Donations";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route
            index
            element={<Navigate to="dashboard" replace />}
          />

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route
            path="publications"
            element={<Publications />}
          />
          <Route path="partners" element={<Partners />} />
          <Route path="team" element={<Team />} />
          <Route
            path="testimonials"
            element={<Testimonials />}
          />
          <Route path="media" element={<Media />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="donations" element={<Donations />} />
        </Route>
      </Route>

      <Route
        path="/"
        element={<Navigate to="/admin/dashboard" replace />}
      />

      <Route
        path="*"
        element={<Navigate to="/admin/dashboard" replace />}
      />
    </Routes>
  );
}