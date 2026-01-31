import React from 'react';
import LoginCard from './modules/auth/login';
import RegisterPage from './modules/auth/register';
import ForgetPasswordPage from './modules/auth/forgetpw';
import GoogleCallbackPage from './modules/auth/google-callback';
import Homepage from './modules/homepage/home';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserHome from './modules/user/home';
import ViewAllCourse from './modules/course/filter_course';
import MyCourse  from './modules/course/mycourse';
import MyCart from './modules/user/mycart';
import NotificationPage from './modules/header/notification'; 
import MyInfo from './modules/avatar_info/myinfo';  
import ChangePasswordPage from './modules/avatar_info/changepw';
import CourseDetail from './modules/course/detailcourse';
import CheckoutPage from './modules/user/checkout';
import CourseProgressPage from './modules/course/courseProgress';
import LessonContentPage from './modules/course/lessonContent';
import SearchPage from './modules/course/searchCoursePage';
import RegisterTeacherPage from './modules/instructor/register_teacher';
import RegisterTeacherFormPage from './modules/instructor/register_teacher_form';
import TeacherDashboard from './modules/instructor/teacher';
import LoginSuccess from './modules/auth/login-success';
import { ProtectedRoute, GuestRoute, InstructorRoute } from './modules/auth/components/AuthGuard';
import ManageCoursePage from './modules/instructor/manage-course';
import AdminDashboard from './modules/admin/dashboard_ad';

function App() {
  return (
    <Router>
      <Routes>
        {/* auth - guest only */}
        <Route path="/" element={<GuestRoute><Homepage /></GuestRoute>} />
        <Route path="/homepage" element={<GuestRoute><Homepage /></GuestRoute>} />
        <Route path="/login" element={<GuestRoute><LoginCard /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgetPasswordPage /></GuestRoute>} />
        <Route path="/auth/google-callback" element={<GoogleCallbackPage />} />
        <Route path="/login-success" element={<LoginSuccess />} />

        {/* protected routes */}
        <Route path="/user/home" element={<ProtectedRoute><UserHome /></ProtectedRoute>} />
        <Route path="/user/mycourses" element={<ProtectedRoute><MyCourse /></ProtectedRoute>} />
        <Route path="/user/cart" element={<ProtectedRoute><MyCart /></ProtectedRoute>} />
        <Route path="/user/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/payment-success" element={<Navigate to="/user/mycourses" />} />
        <Route path="/user/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute><ViewAllCourse /></ProtectedRoute>} />
        <Route path="/courses/complete-react-developer-2024" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
        <Route path="/courses/:courseId" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
        <Route path="/user/profile" element={<ProtectedRoute><MyInfo /></ProtectedRoute>} />
        <Route path="/user/security" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
        <Route path="/user/course-progress" element={<ProtectedRoute><CourseProgressPage /></ProtectedRoute>} />
        <Route path="/user/course-progress/:courseId" element={<ProtectedRoute><CourseProgressPage /></ProtectedRoute>} />
        <Route path="/user/course-progress/:courseId/lesson/:lessonId" element={<ProtectedRoute><LessonContentPage /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        <Route path="/register-teacher" element={<ProtectedRoute><RegisterTeacherPage /></ProtectedRoute>} />
        <Route path="/register-teacher/form" element={<ProtectedRoute><RegisterTeacherFormPage /></ProtectedRoute>} />
        <Route path="/instructor/register-teacher" element={<ProtectedRoute><RegisterTeacherPage /></ProtectedRoute>} />
        <Route path="/instructor/register-teacher/form" element={<ProtectedRoute><RegisterTeacherFormPage /></ProtectedRoute>} />
        <Route path="/instructor" element={<InstructorRoute><TeacherDashboard /></InstructorRoute>} />
        <Route path="/instructor/dashboard" element={<InstructorRoute><TeacherDashboard /></InstructorRoute>} />
        <Route path="/instructor/courses/manage/:courseId" element={<InstructorRoute><ManageCoursePage /></InstructorRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;