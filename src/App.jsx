// src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AdminProvider } from "./context/AdminContext";
import RequireAdmin from "./utils/RequireAdmin";
import ProtectedRoute from "./utils/ProtectedRoute"; // ✅ NEW
import ScrollToTop from "./components/ScrollToTop";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Analytics } from "@vercel/analytics/react";
import { Capacitor } from '@capacitor/core';
import '@codetrix-studio/capacitor-google-auth';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

import './index.css';
import './styles/Footer.css';
import './styles/app-mobile.css';

// Layouts
import Layout from "./components/Layout";
import AdminLayout from "./pages/admin/AdminLayout";

// Firebase push listener
import FCMInitializer from "./components/FCMInitializer";

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
import NotificationDetail from './pages/NotificationDetail';
import NotificationsList from './pages/NotificationsList';

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
import AdminManualNotifications from "./pages/admin/adminNotification/AdminManualNotifications";
import AdminDeleteSubscriptions from "./pages/admin/AdminDeleteSubscriptions";
import AdminSendNotification from "./pages/admin/adminNotification/AdminSendNotification";


function App() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      document.body.classList.add('capacitor');

      // ✅ Initialize GoogleAuth plugin
      GoogleAuth.init({
        clientId: '687684731229-l6296i32tsdet0nfdgd5olk34hd0o259.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    } else {
      document.body.classList.remove('capacitor');
    }
  }, []);

  return (
    <AuthProvider>
      <AdminProvider>
        <Router>
          <ScrollToTop />
          <FCMInitializer />

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
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/testimonials" element={<TestimonialsPage />} />
              <Route path="/contact" element={<ContactUsPage />} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/notifications/:id" element={<NotificationDetail />} />
              <Route path="/notifications" element={<NotificationsList />} />
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
              <Route path="users-report" element={<AdminUsersReport />} />
              <Route path="set-availability" element={<AdminSetAvailability />} />



              <Route path="add-user" element={<AdminAddUser />} />
              <Route path="edit-subscriptions" element={<AdminEditSubscription />} />
              <Route path="add-weeks-sessions" element={<AdminAddWeeksSessions />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="availability" element={<AdminSetAvailability />} />
              <Route path="calendar" element={<AdminCoachCalendar />} />
              <Route path="questionnaire-results" element={<AdminQuestionnaireResults />} />
              <Route path="manual-notifications" element={<AdminManualNotifications />} />
              <Route path="delete-subscription" element={<AdminDeleteSubscriptions />} />
              <Route path="send-notification" element={<AdminSendNotification />} />
            </Route>
          </Routes>
        </Router>
      </AdminProvider>

      <Analytics />
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AuthProvider>
  );
}

export default App;
