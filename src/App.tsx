import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AdminLogin from './auth/adminLogin'
import AdminSignup from './auth/adminSignup'
import StudentLogin from './auth/StudentLogin'
import Dashboard from './Admin/Dashboard'
import Students from './Admin/students'
import CreateStudent from './Admin/createstudent'
import Rooms from './Admin/Rooms'
import RoomDetail from './Admin/RoomDetails'
import StudentDashboard from './Student/Dashboard'
import StudentComplaints from './Student/Complaints'
import AdminComplaints from './Admin/Complaint'
import EditStudent from './Admin/EditStudent'
import HOHDashboard from './HOH/Dashboard'

const App = () => {
  return (
    <div>
      <Routes>

        {/* all route that concern admin */}
        <Route path='/admin/signup' element={<AdminSignup />} />
        <Route path='/admin/login' element={<AdminLogin />} />
        <Route path='/admin/dashboard' element={<Dashboard />} />
        <Route path='/admin/students' element={<Students />} />
        <Route path='/admin/students/new' element={<CreateStudent />} />
        <Route path='/admin/rooms' element={<Rooms />} /> 
        <Route path='/admin/rooms/:roomId' element={<RoomDetail />} />
        <Route path="/admin/students/edit/:id" element={<EditStudent />} />
        <Route path="/admin/complaints" element={<AdminComplaints />} />

        {/* all route that contains student */}
        <Route path='/student/dashboard' element={<StudentDashboard />} />
        <Route path="/student/complaints" element={<StudentComplaints />} />
        <Route path='/student/login' element={<StudentLogin />} />

          {/* all route that contains hoh */}

          <Route path="/hoh/dashboard" element={<HOHDashboard />} />
      </Routes>
    </div>
  )
}

export default App