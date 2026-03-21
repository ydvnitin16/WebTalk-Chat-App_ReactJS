import React from "react";
import SearchUsersInput from "./SearchUsersInput";
import SidebarHeader from "./SidebarHeader";
import ChatList from "./ChatList";

const Sidebar = () => {
    return (
        <>
            <aside
                className={`md:w-1/4 w-full bg-white overflow-y-auto scroll-smooth no-scrollbar rounded-2xl md:rounded-none md:rounded-l-4xl ml-1 md:block dark:bg-zinc-950 dark:text-white ${
                    true ? "hidden md:block" : "block"
                }`}
            >
                {/* Top Bar */}
                <SidebarHeader />

                {/* Search Bar */}
                <SearchUsersInput />

                {/* Chat List */}
                <ChatList />
            </aside>
        </>
    );
};

export default Sidebar;
