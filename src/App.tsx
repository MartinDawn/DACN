import React from 'react';
import LoginCard from './modules/auth/login';
import RegisterPage from './modules/auth/register';
import ForgetPasswordPage from './modules/auth/forgetpw';
import Homepage from './modules/homepage/home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserHome from './modules/user/home';
import ViewAllCourse from './modules/user/viewallcourse';
import MyCourse from './modules/user/mycourse';

function App() {
  return (
    <Router>
      <Routes>
        {/* auth */}
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<LoginCard />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forget-password" element={<ForgetPasswordPage />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/user/home" element={<UserHome />} />
        <Route path="/user/mycourses" element={<MyCourse />} />
        <Route path="/courses" element={<ViewAllCourse />} />
      </Routes>
    </Router>
  );
}

export default App;