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

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/admin/signup' element={<AdminSignup />} />
        <Route path='/admin/login' element={<AdminLogin />} />
        <Route path='/student/login' element={<StudentLogin />} />
        <Route path='/admin/dashboard' element={<Dashboard />} />
        <Route path='/admin/students' element={<Students />} />
        <Route path='/admin/students/new' element={<CreateStudent />} />
        <Route path='/admin/rooms' element={<Rooms />} /> 
        <Route path='/admin/room/:id' element={<RoomDetail />} />
        <Route path='/student/dashboard' element={<StudentDashboard />} />
      </Routes>
    </div>
  )
}

export default App