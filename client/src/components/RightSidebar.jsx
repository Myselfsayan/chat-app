import React, { useState, useEffect, useContext } from 'react';
import assets from '../assets/assets';
import { AuthContext } from '../context/AuthContext.js';
import { ChatContext } from '../context/ChatContext.js';

const RightSidebar = () => {
    const { selectedUser, messages } = useContext(ChatContext);
    const { logout } = useContext(AuthContext);

    const [msgImages, setMsgImages] = useState([]);

    useEffect(() => {
        const images = messages
            .filter((msg) => msg?.media?.url)
            .map((msg) => msg.media.url);

        setMsgImages(images);
    }, [messages]);

    if (!selectedUser) return null;

    return (
        <div className="hidden lg:flex lg:flex-col h-full bg-brand-sidebar border-l border-brand-border text-brand-text overflow-y-auto">
            
            {/* Profile */}
            <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light px-4">
                <div className="relative">
                    <img
                        src={selectedUser?.avatar || assets.avatar_icon}
                        alt=""
                        className="w-20 aspect-square rounded-full ring-2 ring-brand-primary/50 glow-primary-sm"
                    />
                    <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-green-500 ring-2 ring-brand-sidebar shadow-[0_0_6px_2px_rgba(74,222,128,0.5)]"></span>
                </div>

                <h1 className="text-xl font-semibold text-brand-text mt-1">
                    {selectedUser.fullName}
                </h1>

                <p className="text-center text-brand-muted leading-5">{selectedUser.bio}</p>
            </div>

            <hr className="border-brand-border my-4 mx-4" />

            {/* Media Section */}
            <div className="px-4 text-xs flex-1">
                <p className="text-brand-muted uppercase tracking-widest text-[10px] font-semibold mb-3">Media</p>

                <div className="mt-2 max-h-[200px] overflow-y-auto grid grid-cols-2 gap-3">
                    
                    {msgImages.length > 0 ? (
                        msgImages.map((url, index) => (
                            <div
                                key={index}
                                onClick={() => window.open(url, "_blank")}
                                className="cursor-pointer rounded-lg overflow-hidden border border-brand-border hover:border-brand-primary/60 hover:scale-105 transition-all duration-200"
                            >
                                <img
                                    src={url}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        ))
                    ) : (
                        <p className="col-span-2 text-center text-brand-muted py-4">
                            No media yet
                        </p>
                    )}

                </div>
            </div>

            {/* Logout Button */}
            <div className="p-4 flex justify-center">
                <button
                    onClick={logout}
                    className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-sm font-medium py-2 px-10 rounded-full transition-all duration-200 hover:opacity-90 hover:glow-btn glow-btn"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default RightSidebar;