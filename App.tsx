import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import ToolsPage from './pages/ToolsPage';
import AiChatPage from './pages/AiChatPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import CheckoutPage from './pages/CheckoutPage';
import PrivateRoute from './components/PrivateRoute';
import MyCoursesPage from './pages/MyCoursesPage';

// Admin Pages
import DashboardHomePage from './pages/admin/DashboardHomePage';
import ManageCoursesPage from './pages/admin/ManageCoursesPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import SiteSettingsPage from './pages/admin/SiteSettingsPage';
import ManageUserDetailsPage from './pages/admin/ManageUserDetailsPage';
import './db';

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <div className="min-h-screen bg-primary">
          <Navbar />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/course/:courseId" element={<CourseDetailPage />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/ai-chat" element={<AiChatPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/my-courses" element={<MyCoursesPage />} />
              <Route path="/admin-login" element={<AdminLoginPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              
              {/* Admin Dashboard Layout Route */}
              <Route 
                path="/admin" 
                element={
                  <PrivateRoute>
                    <AdminDashboard />
                  </PrivateRoute>
                } 
              >
                <Route index element={<DashboardHomePage />} />
                <Route path="courses" element={<ManageCoursesPage />} />
                <Route path="users" element={<ManageUsersPage />} />
                <Route path="users/:userId" element={<ManageUserDetailsPage />} />
                <Route path="settings" element={<SiteSettingsPage />} />
              </Route>
            </Routes>
          </main>
        </div>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
