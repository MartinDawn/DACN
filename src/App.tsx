import React from 'react';
import LoginCard from './modules/auth/login';
import RegisterPage from './modules/auth/register';
import ForgetPasswordPage from './modules/auth/forgetpw';
import Homepage from './modules/homepage/home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserHome from './modules/user/home';
import ViewAllCourse from './modules/user/viewallcourse';
import MyCourse  from './modules/user/mycourse';
import MyCart from './modules/user/mycart';
import NotificationPage from './modules/header/notification'; 
import MyInfo from './modules/avatar_info/myinfo'; 
import ChangePasswordPage from './modules/avatar_info/changepw';
import CourseDetail from './modules/user/detailcourse';
import CheckoutPage from './modules/user/checkout';
import CourseProgressPage from './modules/user/courseProgress';
import LessonContentPage from './modules/user/lessonContent';

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
        <Route path="/user/notifications" element={<NotificationPage />} />
        <Route path="/courses" element={<ViewAllCourse />} />
        <Route path="/courses/complete-react-developer-2024" element={<CourseDetail />} />
        <Route path="/courses/:courseId" element={<CourseDetail />} />
        <Route path="/user/profile" element={<MyInfo />} />
        <Route path="/user/security" element={<ChangePasswordPage />} />
        <Route path="/user/course-progress" element={<CourseProgressPage />} />
        <Route path="/user/course-progress/:courseId" element={<CourseProgressPage />} />
        <Route path="/user/course-progress/:courseId/lesson/:lessonId" element={<LessonContentPage />} />
      </Routes>
    </Router>
  );
}

export default App;