import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/User/Home";
import MainLayout from "./MainLayout";
import './App.css';
import DrinkListPage from "./pages/User/DrinkListPage";
import DrinkDetail from "./pages/User/DrinkDetail";
import CartPage from "./pages/User/CartPage";
import { CartProvider } from "./context/CartContext";
import AboutPage from "./pages/User/AboutPage";
import UserProfile from "./pages/User/UserProfile";
import AuthPage from "./pages/User/AuthPage";
import ActivitiesPage from "./pages/User/ActivitiesPage";
import ActivityDetail from "./pages/User/ActivityDetail";
import PoliciesPage from "./pages/User/PoliciesPage";
import CareersPage from "./pages/User/CareersPage";
import LocationsPage from "./pages/User/LocationsPage";
import AdminPage from "./pages/Admin/AdminPage";

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="app-master-wrapper">
          {/* Sườn trái */}
          <div className="side-decoration left">
            <div className="water-sparkles"></div>
          </div>
          
          {/* Sườn phải */}
          <div className="side-decoration right">
            <div className="water-sparkles"></div>
          </div>
          
          {/* Aura trung tâm */}
          <div className="water-aura-bg"></div>

          <MainLayout>
            <Routes>
              {/* User */}
              <Route path="/" element={<Home />} />
              <Route path="/DrinkListPage" element={<DrinkListPage />} />
              <Route path="/DrinkListPage?keyword=:keyword" element={<DrinkListPage />} />
              <Route path="/drinkdetail/:id" element={<DrinkDetail />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/profile/:tab" element={<UserProfile />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/activities" element={<ActivitiesPage />} />
              <Route path="/activities/:id" element={<ActivityDetail />} />
              <Route path="/policies/:id" element={<PoliciesPage />} />
              <Route path="/career" element={<CareersPage />} />
              <Route path="/location" element={<LocationsPage />} />
              {/* Admin */}
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </MainLayout>
        </div>
      </BrowserRouter>
    </CartProvider>

  );
}

export default App;