import { useEffect ,useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";



// ================= AXIOS CONFIG =================
const backendUrl = import.meta.env.VITE_BACKEND_URL;


if (!backendUrl) {
    throw new Error("VITE_BACKEND_URL is not defined in environment variables");
}

axios.defaults.baseURL = backendUrl;
axios.defaults.withCredentials = true; // important for cookies (JWT auth)


// ================= PROVIDER =================
const AuthProvider = ({ children }) => {

      // ================= STATE =================
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  // ================= CHECK AUTH =================
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/v1/auth/check");

      if (data?.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      toast.error(error.message)
      console.error("Auth error:", error);
      }
  }

  // ================= LOGIN FUNCTION =================
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/v1/auth/${state}`, credentials);

      if (data?.success) {
        setAuthUser(data.data.user);
        connectSocket(data.data.user);

  axios.defaults.headers.common["token"] = data.data.accessToken;
        setToken(data.data.accessToken);
        localStorage.setItem("token", data.data.accessToken);

        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      return false; // ✅ ADD THIS
    }
  };
  // ================= LOGOUT FUNCTION =================
  const logout = async () => {
    
      // ✅ Clear frontend state
      localStorage.removeItem("token");
      setToken(null);
      setAuthUser(null);
      setOnlineUsers([]);

      // ✅ Remove axios header
      axios.defaults.headers.common["token"] = null;
      toast.success("Logged out successfully");
      socket.disconnect();
      console.error(error);
    }
      // ================= UPDATE ACCOUNT =================
  const updateAccount = async (body) => {
      try {
          const { data } = await axios.patch("/api/v1/auth/update-account", body);

          if (data?.success) {
          setAuthUser(data.data);
          toast.success(data.message);
          } else {
          toast.error(data.message);
          }
      } catch (error) {
          toast.error(error?.response?.data?.message || error.message);
      }
  };
  // ================ UPDATE AVATAR =================
  const updateAvatar = async (file) => {
      try {
          const formData = new FormData();
          formData.append("avatar", file);

          const { data } = await axios.patch(
          "/api/v1/auth/update-avatar",
          formData,
          {
              headers: {
              "Content-Type": "multipart/form-data",
              },
          }
          );

          if (data?.success) {
          setAuthUser(data.data);
          toast.success(data.message);
          } else {
          toast.error(data.message);
          }
      } catch (error) {
          toast.error(error?.response?.data?.message || error.message);
      }
  };

  // ================= CONNECT SOCKET =================
  const connectSocket = (userData) => {
      // Prevent multiple connections
      if (!userData || socket?.connected) return;

      const newSocket = io(backendUrl, {
          //withCredentials: true,
          query: {
          userId: userData?._id,
          },
      });

      // Connect socket
      newSocket.connect();

      // Save socket instance
      setSocket(newSocket);

      // Listen for online users
      newSocket.on("getOnlineUsers", (userIds) => {
          setOnlineUsers(userIds);
      });

      // Handle disconnect (important)
      newSocket.on("disconnect", () => {
          console.log("Socket disconnected");
      });
  };


  // ================= INIT AUTH =================
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
    }
    checkAuth();
  }, []);

  // ================= CONTEXT VALUE =================
  const value = {
      axios,
      authUser,
      onlineUsers,
      socket,
      login,
      logout,
      updateAccount,
      updateAvatar
  };

      return (
          <AuthContext.Provider value={value}>
          {children}
          </AuthContext.Provider>
      );
};

  


export default AuthProvider;


