import { useEffect ,useState } from "react";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { ChatContext } from "./ChatContext";
import toast from "react-hot-toast";

// ================= PROVIDER =================
const ChatProvider = ({ children }) => {

const [messages, setMessages] = useState([]);
const [users, setUsers] = useState([]);
const [selectedUser, setSelectedUser] = useState(null);
const [unseenMessages, setUnseenMessages] = useState({});

// ================= BROWSER BACK BUTTON (MOBILE) =================
// When a user is selected, push a history entry so the browser back
// button intercepts it and returns to sidebar instead of leaving the app.
useEffect(() => {
  if (selectedUser) {
    // Push a "chat open" state into browser history
    window.history.pushState({ chatOpen: true }, "");

    const handlePopState = () => {
      setSelectedUser(null);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }
}, [selectedUser]);

const { socket, axios } = useContext(AuthContext);

// function to get all users for sidebar
const getUsers = async()=>{
  try {
    const { data } = await axios.get("/api/v1/messages/users");
      if(data?.success){
      //console.log(data, "users in chat provider");
      setUsers(data.data);
      const unreadMap = {};
        data.data.forEach((user) => {
          unreadMap[user._id] = user.unreadCount;
        });

        setUnseenMessages(unreadMap);
      }
    } catch (error) {
    toast.error("Failed to fetch users",error)
  }
}
// function to get messages for selected user
const getMessages = async (userId) => {
  try {
    const { data } = await axios.get(`/api/v1/messages/${userId}`);


    if (data.success) {
      setMessages(data.data);
    }
  } catch (error) {
    toast.error(error.message);
  }
};
// function to send message to selected user
const sendMessage = async (messageData) => {
  try {
    const isFormData = messageData instanceof FormData;

    const { data } = await axios.post(
      `/api/v1/messages/send/${selectedUser._id}`,
      messageData,
      {
        withCredentials: true,
        headers: isFormData ? {} : { "Content-Type": "application/json" },
      }
    );

    if (data.success) {
      setMessages((prev) => [...prev, data.data]);
    }
  } catch (error) {
    console.log("❌ ERROR 👉", error.response?.data || error.message);
  }
};

// function to subscribe to messages for selected user
const subscribeToMessages = () => {
  if (!socket) return;

  socket.on("newMessage", (newMessage) => {
    if (selectedUser && newMessage.senderId === selectedUser._id) {
      newMessage.seen = true;

      setMessages((prevMessages) => [
        ...prevMessages,
        newMessage,
      ]);

      axios.put(`/api/v1/messages/seen/${newMessage._id}`);
    } else {
      setUnseenMessages((prevUnseenMessages) => ({
        ...prevUnseenMessages,
        [newMessage.senderId]:
          prevUnseenMessages[newMessage.senderId]
            ? prevUnseenMessages[newMessage.senderId] + 1
            : 1,
      }));
    }
  });
};

// function to unsubscribe from messages
const unsubscribeFromMessages = () => {
  if (socket) socket.off("newMessage");
};

useEffect(() => {
  if (!socket) return;

  const handleNewMessage = (newMessage) => {
    console.log("🔥 SOCKET MESSAGE:", newMessage);

    const senderId = newMessage.sender?.toString();
    const currentChatId = selectedUser?._id?.toString();

    // ✅ If message belongs to currently open chat
    if (senderId === currentChatId) {
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === newMessage._id);
        if (exists) return prev;
        return [...prev, newMessage];
      });
    } else {
      // ✅ Message from OTHER user → increase unread count
      setUnseenMessages((prev) => ({
        ...prev,
        [senderId]: (prev[senderId] || 0) + 1,
      }));
    }
  };

  socket.on("newMessage", handleNewMessage);

  return () => {
    socket.off("newMessage", handleNewMessage);
  };
}, [socket, selectedUser]);


  // ================= CONTEXT VALUE =================
  const value = {
      messages,
      selectedUser,
      users,
      getMessages,
      sendMessage,
      setSelectedUser,
      unseenMessages,
      setUnseenMessages,
      getUsers,

      
  };

      return (
          <ChatContext.Provider value={value}>
          {children}
          </ChatContext.Provider>
      );
};




export default ChatProvider;


