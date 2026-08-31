import { Outlet } from "react-router-dom";
import Navbar from "../components/public/Navbar";
import Footer from "../components/public/Footer";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />

      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}