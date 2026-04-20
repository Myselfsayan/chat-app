import React from 'react'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'
import { ChatContext } from '../context/ChatContext'

function HomePage() {
    const {selectedUser} = React.useContext(ChatContext);

    //const [selectedUser, setSelectedUser] = React.useState(false);
    return (
        <div className="w-full h-screen bg-outer-glow sm:px-[15%] sm:py-[5%]">
        <div className={`border border-brand-border rounded-2xl overflow-hidden h-[100%] grid grid-cols-1 relative bg-brand-surface ${selectedUser ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]' : 'md:grid-cols-2'}`}>
            <Sidebar  />
            <ChatContainer  />
            <RightSidebar  />
        </div>
        </div>
    )
}

export default HomePage
