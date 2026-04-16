import { createContext, useEffect ,useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// ================= AXIOS CONFIG =================
const backendUrl = import.meta.env.VITE_BACKEND_URL;

if (!backendUrl) {
    throw new Error("VITE_BACKEND_URL is not defined in environment variables");
}

axios.defaults.baseURL = backendUrl;
axios.defaults.withCredentials = true; // important for cookies (JWT auth)

// ================= CONTEXT =================
export const AuthContext = createContext();

// ================= PROVIDER =================
export const AuthProvider = ({ children }) => {

    // ================= STATE =================
const [token, setToken] = useState(() => localStorage.getItem("token") || null);
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
        } else {
        setAuthUser(null);
        }
    } catch (error) {
        console.error("Auth check failed:", error?.response?.data || error.message);
        toast.error("Auth check failed:", error?.response?.data || error.message);
        setAuthUser(null);
    }
};

// ================= LOGIN FUNCTION =================
const login = async (type, credentials) => {
    try {
        const { data } = await axios.post(`/api/v1/auth/${type}`, credentials);

        if (data?.success) {
        // Set user
        setAuthUser(data.userData);

        // Connect socket
        connectSocket(data.userData);

        // Set token (only if you're using header-based auth)
        if (data.token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
            setToken(data.token);
            localStorage.setItem("token", data.token);
        }

        toast.success(data.message);
        } else {
        toast.error(data.message);
        }
    } catch (error) {
        toast.error(error?.response?.data?.message || error.message);
    }
};
// ================= LOGOUT FUNCTION =================
const logout = async () => {
    try {
        // Remove token from storage
        localStorage.removeItem("token");
        setToken(null);

        // Clear user state
        setAuthUser(null);
        setOnlineUsers([]);

        // Remove axios auth header
        delete axios.defaults.headers.common["Authorization"];

        // Disconnect socket safely
        if (socket?.connected) {
        socket.disconnect();
        setSocket(null);
        }

        toast.success("Logged out successfully");
    } catch (error) {
        toast.error("Logout failed");
        console.error(error);
    }
};

// ================= UPDATE ACCOUNT =================
const updateAccount = async (body) => {
    try {
        const { data } = await axios.patch("/api/v1/auth/update-account", body);

        if (data?.success) {
        setAuthUser(data.user);
        toast.success(data.message);
        } else {
        toast.error(data.message);
        }
    } catch (error) {
        toast.error(error?.response?.data?.message || error.message);
    }
};
// ================= UPDATE AVATAR =================
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
        setAuthUser(data.user);
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
        withCredentials: true,
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
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    checkAuth();
}, [token]);

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