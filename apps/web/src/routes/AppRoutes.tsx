import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import AuthLayout from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";

import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Projects from "../pages/public/Projects";
import ProjectDetails from "../pages/public/ProjectDetails";
import Publications from "../pages/public/Publications";
import PublicationDetails from "../pages/public/PublicationDetails";
import Contact from "../pages/public/Contact";
import Donate from "../pages/public/Donate";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/admin/Dashboard";

export default function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC WEBSITE */}

      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/projects"
          element={<Projects />}
        />

        <Route
          path="/projects/:id"
          element={<ProjectDetails />}
        />

        <Route
          path="/publications"
          element={<Publications />}
        />

        <Route
          path="/publications/:id"
          element={<PublicationDetails />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        <Route
          path="/donate"
          element={<Donate />}
        />
      </Route>

      {/* ADMIN AUTH */}

      <Route element={<AuthLayout />}>
        <Route
          path="/admin/login"
          element={<Login />}
        />
      </Route>

      {/* ADMIN */}

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route
            path="/admin/dashboard"
            element={<Dashboard />}
          />

          {/* Add the remaining CMS pages here
              as their CRUD APIs are connected. */}
        </Route>
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}