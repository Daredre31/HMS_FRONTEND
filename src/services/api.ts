import axios from "axios";

// Point this at your Render deployment URL once you've hosted the backend.
// For local development, it falls back to localhost automatically.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/server";

// Single axios instance shared across the whole app.
// Everything — auth headers, base URL, timeouts — is configured here
// so individual components never need to think about it.
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Attach the JWT to every outgoing request automatically.
// Components just call the API; the token handling is invisible to them.
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("hms_token") ||
      localStorage.getItem("hms_student_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handler.
// 401 means the token expired or was tampered with — log the user out.
// Everything else gets passed back to the calling component to handle.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("hms_token");
      localStorage.removeItem("hms_student_token");
      localStorage.removeItem("hms_user");
      localStorage.removeItem("hms_student");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);


// ── Auth ─────────────────────────────────────────────────────

export const adminSignupAPI = (data: {
  name: string;
  email: string;
  password: string;
}) => api.post("/createAdmin", data);

export const adminLoginAPI = (data: {
  email: string;
  password: string;
}) => api.post("/loginAdmin", data);

export const studentLoginAPI = (data: {
  tokenId: string;
}) => api.post("/loginStudent", data);

export const createHOHAPI = (data: {
  name: string;
  email: string;
  password: string;
}) => api.post("/signup/hoh", data);


// ── Students ─────────────────────────────────────────────────

export const getAllStudentsAPI = () => api.get("/getStudents");

export const createStudentAPI = (data: {
  name: string;
  email: string;
  bedId: string;
  paymentStatus: string;
  currentSession: string;
  expiryDate: string;
}) => api.post("/createStudent", data);

export const getStudentByIdAPI = (id: string) => api.get(`/student/${id}`);

export const updateStudentAPI = (id: string, data: Partial<{
  name: string;
  email: string;
  paymentStatus: string;
  currentSession: string;
  expiryDate: string;
}>) => api.patch(`/student/${id}`, data);

export const deleteStudentAPI = (id: string) => api.delete(`/student/${id}`);


// ── Rooms ─────────────────────────────────────────────────────

export const getAllRoomsAPI = () => api.get("/allroom");

export const createRoomAPI = (data: {
  roomNumber: string;
  roomCapacity: number;
}) => api.post("/room", data);


// ── Beds ─────────────────────────────────────────────────────

export const getAllBedsAPI = () => api.get("/allbed");

export const createBedAPI = (data: {
  bedNumber: string;
  room: string;
}) => api.post("/bed", data);


// ── Payments ─────────────────────────────────────────────────

// These will be wired up once the payment backend is ready
export const getPaymentsAPI = () => api.get("/payments");

export const recordManualPaymentAPI = (data: {
  studentId: string;
  amount: number;
  paymentDate: string;
}) => api.post("/payments/manual", data);


// ── Complaints ───────────────────────────────────────────────

export const getComplaintsAPI = () => api.get("/complaints");

export const createComplaintAPI = (data: {
  title: string;
  description: string;
}) => api.post("/complaints", data);


// ── Tasks ────────────────────────────────────────────────────

export const getTasksAPI = () => api.get("/tasks");

export const createTaskAPI = (data: {
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
}) => api.post("/tasks", data);


// ── Notifications ────────────────────────────────────────────

export const getNotificationsAPI = () => api.get("/notifications");

export default api;
