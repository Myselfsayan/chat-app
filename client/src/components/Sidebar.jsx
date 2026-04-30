import React, { useEffect } from 'react'
import { useState } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useContext } from 'react'
import  {ChatContext}  from '../context/ChatContext'


function Sidebar() {
    const {users,getUsers,selectedUser,setSelectedUser,unseenMessages , setUnseenMessages} = useContext(ChatContext);
    const { logout ,onlineUsers } = useContext(AuthContext);
    const navigate = useNavigate()
    const [input, setInput] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const filteredUsers = input
        ?users.filter((user) =>
            user.fullName.toLowerCase().includes(input.toLowerCase())
            )
        : users;
        //console.log(users, "users in sidebar");
        //console.log(getUsers, "users in sidebar getuser");
        useEffect(() => {
            getUsers();
        }, [onlineUsers]);
    return (
        <div className={`bg-brand-sidebar h-full p-5 rounded-r-xl overflow-y-scroll text-brand-text border-r border-brand-border ${selectedUser ? "max-md:hidden" : ""}`}>
            <div className='pb-5'>
                <div className='flex justify-between items-center'>
                <div className="flex items-center gap-2">
                    <img src={assets.convolink_logo} alt="ConvoLink" className='w-8 h-8 drop-shadow-[0_0_8px_rgba(91,157,255,0.7)]' />
                    <span className="text-brand-text font-bold text-lg tracking-wide">ConvoLink</span>
                </div>
                    <div className="relative py-2">
                        <img
                            src={assets.menu_icon}
                            onClick={() => setShowMenu(prev => !prev)}
                            alt="menu"
                            className="max-h-5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity duration-200"
                        />

                        {showMenu && (
                            <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-lg bg-brand-surface border border-brand-border text-brand-text shadow-xl">
                            <p
                                onClick={() => {
                                navigate('/profile');
                                setShowMenu(false);
                                }}
                                className="cursor-pointer text-sm text-brand-muted hover:text-brand-text transition-colors duration-200"
                            >
                                Edit Profile
                            </p>

                            <hr className="my-2 border-t border-brand-border" />

                            <p
                                onClick={() => {
                                logout();
                                setShowMenu(false);
                                }}
                                className="cursor-pointer text-sm text-brand-muted hover:text-brand-text transition-colors duration-200"
                            >
                                Logout
                            </p>
                            </div>
                        )}
                    </div>
                </div>
                {/* ****************  Search Box  ********************************** */}
                <div className="bg-brand-surface border border-brand-border rounded-full flex items-center gap-2 py-3 px-4 mt-5 focus-within:border-brand-primary focus-within:glow-primary-sm transition-all duration-200">
                    <img src={assets.search_icon} alt="Search" className="w-3 opacity-50" />
                    <input
                    onChange={(e)=>setInput(e.target.value)}
                    type="text"
                    placeholder="Search User..."
                    className="bg-transparent border-none outline-none text-brand-text text-xs placeholder-brand-muted flex-1 "/>
                </div>
            </div>
            {/* ************************ User List  ********************************** */}
                <div className="flex flex-col gap-1">
                {filteredUsers.map((user, index) => (
                    <div
                    onClick={()=>{setSelectedUser(user); setUnseenMessages(prev=>({...prev,[user._id]:0}))}}
                    key={index}
                    className={`relative flex items-center gap-3 p-2 pl-4 rounded-lg cursor-pointer max-sm:text-sm transition-all duration-200 hover:bg-brand-surface/80 ${selectedUser?._id === user._id ? 'bg-brand-surface border border-brand-border glow-primary-sm' : 'border border-transparent'}`}>

                        <img
                            src={user?.avatar?.url || assets.avatar_icon}
                            alt=""
                            className={`w-[35px] aspect-[1/1] rounded-full ring-2 ${selectedUser?._id === user._id ? 'ring-brand-primary/60' : 'ring-transparent'}`}
                        />

                                <div className="flex flex-col leading-5">
                                    <p className="text-brand-text font-medium text-sm">{user.fullName}</p>

                                    {onlineUsers.includes(user._id) ? (
                                    <span className="text-green-400 text-xs">Online</span>
                                    ) : (
                                    <span className="text-brand-muted text-xs">Offline</span>
                                    )}
                                </div>

                            {unseenMessages[user._id]>0 && (
                                <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold">
                                {unseenMessages[user._id]}
                                </p>
                            )}

                    </div>
            ))}
                </div>
            </div>
    )
}

export default Sidebar
