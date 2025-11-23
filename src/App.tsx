import React from 'react';
import LoginCard from './modules/auth/login';
import RegisterPage from './modules/auth/register';
import ForgetPasswordPage from './modules/auth/forgetpw';
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

function App() {
  return (
    <Router>
      <Routes>
        {/* auth */}
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<LoginCard />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgetPasswordPage />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/user/home" element={<UserHome />} />
        <Route path="/user/mycourses" element={<MyCourse />} />
        <Route path="/user/cart" element={<MyCart />} />
        <Route path="/user/checkout" element={<CheckoutPage />} />
        <Route path="/payment-success" element={<Navigate to="/user/mycourses" />} />
        <Route path="/user/notifications" element={<NotificationPage />} />
        <Route path="/courses" element={<ViewAllCourse />} />
        <Route path="/courses/complete-react-developer-2024" element={<CourseDetail />} />
        <Route path="/courses/:courseId" element={<CourseDetail />} />
        <Route path="/user/profile" element={<MyInfo />} />
        <Route path="/user/security" element={<ChangePasswordPage />} />
        <Route path="/user/course-progress" element={<CourseProgressPage />} />
        <Route path="/user/course-progress/:courseId" element={<CourseProgressPage />} />
        <Route path="/user/course-progress/:courseId/lesson/:lessonId" element={<LessonContentPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/register-teacher" element={<RegisterTeacherPage />} />
        <Route path="/register-teacher/form" element={<RegisterTeacherFormPage />} />
        <Route path="/instructor/register-teacher" element={<RegisterTeacherPage />} />
        <Route path="/instructor/register-teacher/form" element={<RegisterTeacherFormPage />} />
        <Route path="/instructor" element={<TeacherDashboard />} />
        <Route path="/instructor/dashboard" element={<TeacherDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;