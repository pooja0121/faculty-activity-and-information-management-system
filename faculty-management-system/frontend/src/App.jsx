import React, { useState, useMemo, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Home from './components/Home';
import AdminLogin from './components/AdminLogin'; // Correctly importing AdminLogin
import FacultyLogin from './components/FacultyLogin';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import FacultyDashboard from './components/FacultyDashboard';
import AddFacultyDevelopmentProgram from './components/AddFacultyDevelopmentProgram';
import AddWorkshop from './components/AddWorkshop';
import Departments from './components/Departments';
import Reports from './components/Reports';
import AddSeminar from './components/AddSeminar';
import AddIndustryKnowHow from './components/AddIndustryKnowHow';
import AddFellowship from './components/AddFellowship';
import AddPublication from './components/AddPublication';
import AddPatent from './components/AddPatent';
import AddProjectProposal from './components/AddProjectProposal';
import AddFundingReceiving from './components/AddFundingReceiving';
import AddPhdDegree from './components/AddPhdDegree';
import AddGuestLectureDeliver from './components/AddGuestLectureDeliver';
import DepartmentFaculty from './components/DepartmentFaculty';
import FacultyEvents from './components/FacultyEvents';  // Added missing import
import PublicDepartments from './components/PublicDepartments';
import PublicDepartmentFaculty from './components/PublicDepartmentFaculty';
import PublicFacultyProfile from './components/PublicFacultyProfile';
import FacultyDetails from './components/FacultyDetails';
import CompleteRegistration from './components/CompleteRegistration';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, token, role, requiredRole, redirectTo }) => {
  if (!token || role !== requiredRole) {
    const hasTokenParam = new URLSearchParams(window.location.search).has('token');
    if (!hasTokenParam) {
      return <Navigate to={redirectTo} />;
    }
    // If OAuth params present, wait for state update
    return null;
  }
  return children;
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || '');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Handle OAuth redirect parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    const roleParam = urlParams.get('role');
    const nameParam = urlParams.get('name');

    if (tokenParam && roleParam) {
      setToken(tokenParam);
      setRole(roleParam);
      localStorage.setItem('token', tokenParam);
      localStorage.setItem('role', roleParam);
      if (nameParam) {
        localStorage.setItem('name', nameParam);
      }
      // Clean up URL parameters and redirect to dashboard
      const redirectPath = roleParam === 'faculty' ? '/faculty-dashboard' : '/admin-dashboard';
      window.history.replaceState({}, document.title, redirectPath);
      window.location.href = redirectPath;
    }
  }, []);

  const handleLogin = (newToken, newRole) => {
    setToken(newToken);
    setRole(newRole);
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newRole);
  };

  const handleLogout = () => {
    setToken('');
    setRole('');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  };

  // Apply theme on mount
  useMemo(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [theme]);

  const routes = [
    { path: "/", element: <Home /> },
    { path: "/public-departments", element: <PublicDepartments /> },
    { path: "/public-department/:deptCode", element: <PublicDepartmentFaculty /> },
    { path: "/public-faculty/:facultyId", element: <FacultyDetails /> },
    { path: "/admin-login", element: <AdminLogin onLogin={(t, r) => handleLogin(t, r)} /> },
    { path: "/faculty-login", element: <FacultyLogin onLogin={(t) => handleLogin(t, 'faculty')} theme={theme} setTheme={handleThemeChange} /> },
    { path: "/complete-registration", element: <CompleteRegistration onLogin={(t, r) => handleLogin(t, r)} /> },
    { path: "/register", element: <Register onLogin={(t, r) => handleLogin(t, r)} /> },
    { path: "/admin-dashboard", element: token && role === 'admin' ? <AdminDashboard token={token} onLogout={handleLogout} /> : <Navigate to="/admin-login" /> },
    { path: "/faculty-dashboard", element: <ProtectedRoute token={token} role={role} requiredRole="faculty" redirectTo="/faculty-login"><FacultyDashboard token={token} onLogout={handleLogout} /></ProtectedRoute> },
    { path: "/department/:deptCode", element: token && role === 'admin' ? <DepartmentFaculty token={token} /> : <Navigate to="/admin-login" /> },
    { path: "/faculty-events/:facultyId", element: token && role === 'admin' ? <FacultyEvents token={token} /> : <Navigate to="/admin-login" /> },
    { path: "/faculty/:facultyId", element: token && (role === 'admin' || role === 'faculty') ? <FacultyDetails token={token} /> : <Navigate to="/faculty-login" /> },
    { path: "/add-faculty-development-program", element: token && (role === 'faculty' || role === 'admin') ? <AddFacultyDevelopmentProgram /> : <Navigate to="/faculty-login" /> },
    { path: "/add-workshop", element: token && (role === 'faculty' || role === 'admin') ? <AddWorkshop /> : <Navigate to="/faculty-login" /> },
    { path: "/add-seminar", element: token && (role === 'faculty' || role === 'admin') ? <AddSeminar /> : <Navigate to="/faculty-login" /> },
    { path: "/add-industry-know-how", element: token && (role === 'faculty' || role === 'admin') ? <AddIndustryKnowHow /> : <Navigate to="/faculty-login" /> },
    { path: "/add-fellowship", element: token && (role === 'faculty' || role === 'admin') ? <AddFellowship /> : <Navigate to="/faculty-login" /> },
    { path: "/add-publication", element: token && (role === 'faculty' || role === 'admin') ? <AddPublication /> : <Navigate to="/faculty-login" /> },
    { path: "/add-patent", element: token && (role === 'faculty' || role === 'admin') ? <AddPatent /> : <Navigate to="/faculty-login" /> },
    { path: "/add-project-proposal", element: token && (role === 'faculty' || role === 'admin') ? <AddProjectProposal /> : <Navigate to="/faculty-login" /> },
    { path: "/add-funding-receiving", element: token && (role === 'faculty' || role === 'admin') ? <AddFundingReceiving /> : <Navigate to="/faculty-login" /> },
    { path: "/add-phd-degree", element: token && (role === 'faculty' || role === 'admin') ? <AddPhdDegree /> : <Navigate to="/faculty-login" /> },
    { path: "/add-guest-lecture-deliver", element: token && (role === 'faculty' || role === 'admin') ? <AddGuestLectureDeliver /> : <Navigate to="/faculty-login" /> },
    { path: "/departments", element: token && role === 'admin' ? <Departments token={token} /> : <Navigate to="/admin-login" /> },
    { path: "/reports", element: token && role === 'admin' ? <Reports token={token} /> : <Navigate to="/admin-login" /> },
  ];

  const router = createBrowserRouter(routes, { future: { v7_startTransition: true, v7_relativeSplatPath: true } });

  return <RouterProvider router={router} />;
}

export default App;
