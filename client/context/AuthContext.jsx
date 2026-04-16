import { createContext } from "react";
import axios from "axios";

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

// ================= CONTEXT VALUE =================
const value = {
    axios,
    token,
    setToken,
    authUser,
    setAuthUser,
    onlineUsers,
    setOnlineUsers,
    socket,
    setSocket,
};

    return (
        <AuthContext.Provider value={value}>
        {children}
        </AuthContext.Provider>
    );
};