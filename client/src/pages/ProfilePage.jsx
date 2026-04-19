import React from 'react'
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';
import { AuthContext } from '../context/AuthContext';
import { useState } from 'react';
import { useContext } from 'react';

function ProfilePage() {

    const {authUser,updateAccount,updateAvatar} = useContext(AuthContext);

    const [selectedImage, setSelectedImage] = useState(null);
    const [name, setName] = useState(authUser?.fullName || "");
    const [bio, setBio] = useState(authUser?.bio || "Hi, Guys!");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
            // Update name + bio 
            await updateAccount({
            fullName: name,
            bio
            });
            // Update avatar only if selected
            if (selectedImage) {
            updateAvatar(selectedImage);
            navigate("/");
            }

            navigate("/"); //always redirect after all updates
    } catch (error) {
        console.log(error);
    }
};


    return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center">
            <div className="w-5/6 max-w-2xl bg-brand-surface text-brand-text border border-brand-border flex items-center justify-between max-sm:flex-col-reverse rounded-xl shadow-2xl glow-primary-sm">
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-10 flex-1">
                    <h3 className="text-lg font-semibold text-brand-text">Profile details</h3>

                    <label
                        htmlFor="avatar"
                        className="flex items-center gap-3 cursor-pointer group"
                    >
                        <input
                        onChange={(e)=>setSelectedImage(e.target.files[0])}
                        type="file"
                        id="avatar"
                        accept=".png, .jpg, .jpeg"
                        hidden
                        />
                        <img src={selectedImage ? URL.createObjectURL(selectedImage) : assets.avatar_icon} 
                        alt="" className={`w-12 h-12 ring-2 ring-brand-border group-hover:ring-brand-primary/60 transition-all duration-200 ${selectedImage && `rounded-full`}`} />
                        <span className="text-brand-muted text-sm group-hover:text-brand-primary transition-colors duration-200">Upload profile picture</span>
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Your name"
                        className="p-2.5 bg-brand-sidebar border border-brand-border rounded-lg text-brand-text placeholder-brand-muted outline-none focus:border-brand-primary focus:shadow-[0_0_0_2px_rgba(124,92,255,0.15)] transition-all duration-200"
                    />
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Write profile bio"
                        required
                        rows={4}
                        className="p-2.5 bg-brand-sidebar border border-brand-border rounded-lg text-brand-text placeholder-brand-muted outline-none focus:border-brand-primary focus:shadow-[0_0_0_2px_rgba(124,92,255,0.15)] transition-all duration-200 resize-none"
                    />

                    <button
                        type="submit"
                        className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white p-2.5 rounded-full text-base font-medium cursor-pointer hover:opacity-90 glow-btn transition-all duration-200"
                        >
                        Save
                    </button>
                </form>

                <div className="mx-10 max-sm:mt-10 flex flex-col items-center gap-3">
                    <img
                    className={`max-w-44 aspect-square ring-4 ring-brand-primary/40 glow-primary ${selectedImage ? "rounded-full" : "rounded-full"}`}
                    src={
                        selectedImage
                        ? URL.createObjectURL(selectedImage)
                        : authUser?.avatar
                    }
                    alt=""
                    />
                </div>
                
            </div>
        </div>
    )
}

export default ProfilePage
