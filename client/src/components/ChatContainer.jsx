import React from 'react'
import assets from '../assets/assets' 
import { useRef, useEffect ,useState } from 'react'
import { formatMessageTime } from '../lib/utils';
import { ChatContext } from '../context/ChatContext'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import toast from 'react-hot-toast';


const ChatContainer = () => {
  const {messages , selectedUser , setSelectedUser , getMessages , sendMessage} = useContext(ChatContext);
  const {authUser , onlineUsers} = useContext(AuthContext);

    const scrollEnd = useRef();
    const [input, setInput] = useState("");

    const handleSendMessage = async (e) => {
      e.preventDefault();
      if (input.trim() === "") return; // Don't send empty messages
      await sendMessage({ message: input.trim() });
      setInput("");
    }
    const handleSendImage = async (e) => {
  console.log("🔥 IMAGE HANDLER CALLED");

  const files = e.target.files;
  console.log("FILES 👉", files);

  if (!files || files.length === 0) {
    console.log("❌ No file");
    return;
  }

  const file = files[0];
  console.log("FILE 👉", file);

  const formData = new FormData();
  formData.append("image", file);

  console.log("FORMDATA 👉", [...formData.entries()]);
  console.log("🚀 CALLING sendMessage...");
  await sendMessage(formData);
console.log("✅ sendMessage FINISHED");
  e.target.value = "";
};
    useEffect(()=>{
      if(selectedUser){
        getMessages(selectedUser._id);
      }
    },[selectedUser])
    useEffect(() => {
      if (scrollEnd.current && messages) {
        scrollEnd.current.scrollIntoView({ behavior: "smooth" });
      }
    }, [messages]);
    // now in dependency array we have messagesDummyData, so whenever it changes, the useEffect will run and scroll to the end of the chat.

  return selectedUser ? (
    <div className="h-full overflow-scroll relative bg-brand-surface">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 py-3 mx-4 border-b border-brand-border bg-brand-surface">
        
        <img
          src={selectedUser.avatar || assets.avatar_icon}
          alt=""
          className="w-8 h-8 rounded-full ring-2 ring-brand-primary/40 object-cover"
        />

        <p className="flex-1 text-lg text-brand-text font-medium flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id)?
          <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_2px_rgba(74,222,128,0.4)]"></span> :''}
        </p>

        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt=""
          className="md:hidden max-w-7 opacity-60 hover:opacity-100 transition-opacity duration-200 cursor-pointer"
        />

        <img
          src={assets.help_icon}
          alt=""
          className="max-md:hidden max-w-5 opacity-50 hover:opacity-80 transition-opacity duration-200"
        />

      </div>
      {/* Chat Area */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6 gap-2">
        {messages.map((msg, index) => (
  <div
    key={msg._id || index}
    className={`flex items-end gap-2 justify-end ${
      msg.sender?.toString() !== authUser._id?.toString() && "flex-row-reverse"
    }`}
  >
    {msg.media?.url ? (
      <img
        src={msg.media.url}
        className="max-w-[230px] border border-brand-border rounded-xl mb-8 shadow-lg"
      />
    ) : (
      <p
        className={`p-3 max-w-[220px] md:text-sm rounded-2xl mb-8 break-words leading-relaxed text-brand-text text-[13px] ${
          msg.sender?.toString() === authUser._id?.toString()
            ? "bg-gradient-to-br from-brand-primary to-brand-secondary rounded-br-sm shadow-[0_2px_14px_2px_rgba(124,92,255,0.25)]"
            : "bg-brand-sidebar border border-brand-border rounded-bl-sm"
        }`}
      >
        {msg.message}
      </p>
    )}

    <div className="text-center text-xs mb-8">
      <img
        src={
          msg.sender?.toString() === authUser._id?.toString()
            ? authUser?.avatar || assets.avatar_icon
            : selectedUser?.avatar || assets.avatar_icon
        }
        className="w-7 h-7 rounded-full ring-1 ring-brand-border object-cover"
      />
      <p className="text-brand-muted mt-1">
        {formatMessageTime(msg.createdAt)}
      </p>
    </div>
  </div>
))}
        <div ref={scrollEnd} />

        </div>
        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3 bg-brand-surface border-t border-brand-border">
          <div className="flex-1 flex items-center bg-brand-sidebar border border-brand-border px-3 rounded-full transition-all duration-200 focus-within:border-brand-primary focus-within:shadow-[0_0_0_2px_rgba(124,92,255,0.15)]">
            
                <input
                  onChange={(e)=>setInput(e.target.value)}
                  value={input}
                  onKeyDown={(e)=>{if(e.key === "Enter")  handleSendMessage(e)}}
                  type="text"
                  placeholder="Send a message"
                  className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-brand-text placeholder-brand-muted bg-transparent"
                />

                <input
                  type="file"
                  id="image"
                  accept="image/png, image/jpeg"
                  hidden
                  onChange={handleSendImage}
                />

                <label htmlFor="image">
                  <img
                    src={assets.gallery_icon}
                    alt=""
                    className="w-5 mr-2 cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-200"
                  />
                </label>

            </div>

              <img
              onClick={handleSendMessage}
                src={assets.send_button}
                alt=""
                className="w-7 cursor-pointer opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-200"
              />
        </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-3 text-brand-muted bg-brand-surface max-md:hidden">
      <img src={assets.convolink_logo} alt="" className="w-20 opacity-80 drop-shadow-[0_0_16px_rgba(91,157,255,0.5)]" />
      <p className="text-xl font-semibold text-brand-text">ConvoLink</p>
      <p className="text-sm text-brand-muted">Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer
