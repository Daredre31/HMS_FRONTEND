import axios from "axios";

// Point this at your Render deployment URL once you've hosted the backend.
// For local development, it falls back to localhost automatically.
const BASE_URL = import.meta.env.VITE_API_URL;

// Single axios instance shared across the whole app.
// Everything — auth headers, base URL, timeouts — is configured here
// so individual components never need to think about it.
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true, // lets the browser send/receive the httpOnly refreshToken cookie
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

// ── Refresh handling ──
// If multiple requests fail at once (e.g. a page loads several API calls together),
// only one of them should trigger /refresh — the rest just wait for that one to finish.
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

function clearAuthAndRedirect() {
  const isStudent = !!localStorage.getItem("hms_student_token");
  localStorage.removeItem("hms_token");
  localStorage.removeItem("hms_student_token");
  localStorage.removeItem("hms_user");
  localStorage.removeItem("hms_student");
  window.location.href = isStudent ? "/student/login" : "/admin/login"; 
}
// Global response error handler.
// 401 means the access token expired — try /refresh first (cookie goes automatically)
// before treating it as a real logout.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await axios.post(
          `${BASE_URL}/refresh`,
          {},
          { withCredentials: true }
        );
        const { accessToken } = res.data.data;

        console.log("refresh", res)
        console.log("access", accessToken)

        const isStudent = !!localStorage.getItem("hms_student_token");
        localStorage.setItem(isStudent ? "hms_student_token" : "hms_token", accessToken);

        isRefreshing = false;
        onRefreshed(accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        isRefreshing = false;
        clearAuthAndRedirect();
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);


// ── Auth 

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

export const logout = () => api.post('/logout')



// Students 
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
  role:string
}>) => api.patch(`/updateStudent/${id}`, data);

export const deleteStudentAPI = (id: string) => api.delete(`/deleteStudent/${id}`);

// dashboardStats 

export const dashboardStats = () => api.get("/dashboardstats")

//  Rooms 
export const getAllRoomsAPI = () => api.get("/allroom");

export const createRoomAPI = (data: {
  roomNumber: string;
  roomCapacity: number;
}) => api.post("/room", data);
export const getRoomByIdAPI = (id: string) => api.get(`/room/${id}`)


// Beds 

export const getAllBedsAPI = () => api.get("/allbed");

export const createBedAPI = (data: {
  bedNumber: string;
  room: string;
}) => api.post("/bed", data);



// ── Payments ──
// These will be wired up once the payment backend is ready
export const getPaymentsAPI = () => api.get("/payments");

export const recordManualPaymentAPI = (data: {
  studentId: string;
  amount: number;
  paymentDate: string;
}) => api.post("/payments/manual", data);


//  Complaints 
export const getComplaintsAPI = () => api.get("/viewallcomplains");
export const getMyComplaintsAPI = () => api.get("/viewmycomplain");

export const createComplaintAPI = (data: {
  title: string;
  description: string;
}) => api.post("/createcomplain", data);

export const respondToComplaintAPI = (id: string, data: any) => api.put(`/replycomplain/${id}`, data)

//Tasks 
export const getAllTasksAPI = () => api.get("/alltasks");

export const createTaskAPI = (data: {
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
}) => api.post("/asigntask", data);

export const getMyTasksAPI = () => api.get('/mytask');
export const completeTaskAPI =(id:string) =>  api.patch(`/completetask/${id}`)


//  Notifications 

export const getNotificationsAPI = () => api.get("/notifications");

export default api;