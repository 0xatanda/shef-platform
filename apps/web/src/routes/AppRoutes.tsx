import { Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/auth/Login";

import PublicLayout from "../layouts/PublicLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";

import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Projects from "../pages/public/Projects";
import Publications from "../pages/public/Publications";
import Contact from "../pages/public/Contact";


import Dashboard from "../pages/admin/Dashboard";
import AdminProjects from "../pages/admin/Projects";
import AdminPublications from "../pages/admin/Publications";
import Partners from "../pages/admin/Partners";
import Team from "../pages/admin/Team";
import Testimonials from "../pages/admin/Testimonials";
import Media from "../pages/admin/Media";
import Contacts from "../pages/admin/Contacts";
import Donations from "../pages/admin/Donations";

export default function AppRoutes() {
  return (
    <Routes>
      {/* AUTH */}
      <Route path="/login" element={<Login />} />

      {/* PUBLIC WEBSITE */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />} />

        <Route
          path="/projects"
          element={<Projects />}
        />

        <Route
          path="/publications"
          element={<Publications />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />
      </Route>

      {/* ADMIN */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/admin"
          element={<AdminLayout />}
        >
          <Route
            index
            element={
              <Navigate
                to="/admin/dashboard"
                replace
              />
            }
          />

          <Route
            path="dashboard"
            element={<Dashboard />}
          />

          <Route
            path="projects"
            element={<AdminProjects />}
          />

          <Route
            path="publications"
            element={<AdminPublications />}
          />

          <Route
            path="partners"
            element={<Partners />}
          />

          <Route
            path="team"
            element={<Team />}
          />

          <Route
            path="testimonials"
            element={<Testimonials />}
          />

          <Route
            path="media"
            element={<Media />}
          />

          <Route
            path="contacts"
            element={<Contacts />}
          />

          <Route
            path="donations"
            element={<Donations />}
          />
        </Route>
      </Route>

      {/* FALLBACK */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}