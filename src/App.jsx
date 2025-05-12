// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AdminProvider } from "./context/AdminContext";
import RequireAdmin from "./utils/RequireAdmin";
import "./index.css";
import ScrollToTop from "./components/ScrollToTop";


// Layouts
import Layout from "./components/Layout";
import AdminLayout from "./pages/admin/AdminLayout";

// Public/User Pages
import Home from "./pages/Home";
import Signup from "./pages/Signup/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import CompleteProfile from "./pages/Signup/CompleteProfile";
import VerifyEmailNotice from "./pages/Signup/VerifyEmailNotice";
import About from "./pages/About";
import Programs from "./pages/Programs";
import ProgramDetails from "./pages/ProgramDetails";
import Questionnaire from "./pages/Questionnaire";
import Profile from "./pages/Profile";
import UserDashboard from "./pages/UserDashboard";
import TestimonialsPage from "./pages/TestimonialsPage";
import ContactUsPage from "./pages/ContactUsPage";
import SuccessPage from "./pages/SuccessPage";

import { Analytics } from "@vercel/analytics/react";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsersReport from "./pages/admin/AdminUsersReport";
import AdminAddUser from "./pages/admin/AdminAddUser";
import AdminEditSubscription from "./pages/admin/AdminEditSubscription";
import AdminAddWeeksSessions from "./pages/admin/AdminAddWeeksSessions";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminSetAvailability from "./pages/admin/AdminSetAvailability";
import AdminCoachCalendar from "./pages/admin/AdminCoachCalendar";
import AdminQuestionnaireResults from "./pages/admin/AdminQuestionnaireResults";
import AdminManualNotifications from "./pages/admin/AdminManualNotifications";
import AdminDeleteSubscriptions from "./pages/admin/AdminDeleteSubscriptions";


function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* === PUBLIC + USER ROUTES === */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/programs/:slug" element={<ProgramDetails />} />
              <Route path="/questionnaire" element={<Questionnaire />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/signup/verify-email" element={<VerifyEmailNotice />} />
              <Route path="/signup/complete-profile" element={<CompleteProfile />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/testimonials" element={<TestimonialsPage />} />
              <Route path="/contact" element={<ContactUsPage />} />
              <Route path="/success" element={<SuccessPage />} />

            </Route>

            {/* === PROTECTED ADMIN ROUTES === */}
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsersReport />} />
              <Route path="add-user" element={<AdminAddUser />} />
              <Route path="edit-subscription" element={<AdminEditSubscription />} />
              <Route path="add-weeks-sessions" element={<AdminAddWeeksSessions />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="availability" element={<AdminSetAvailability />} />
              <Route path="calendar" element={<AdminCoachCalendar />} />
              <Route path="questionnaire-results" element={<AdminQuestionnaireResults />} />
              <Route path="manual-notifications" element={<AdminManualNotifications />} />
              <Route path="delete-subscription" element={<AdminDeleteSubscriptions />} />

            </Route>
          </Routes>
        </Router>

      </AdminProvider>
      <Analytics />
    </AuthProvider>
  );
}

export default App;
