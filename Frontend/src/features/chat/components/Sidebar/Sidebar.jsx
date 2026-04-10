import React from "react";
import SearchUsersInput from "./SearchUsersInput";
import SidebarHeader from "./SidebarHeader";
import ConversationList from "./ConversationList";
import useLogout from "@/features/auth/hooks/useLogout";
import useAuthStore from "@/stores/useAuthStore";
import useChatStore from "@/stores/useChatStore";

const Sidebar = () => {
    const { handleLogout } = useLogout();
    const { currentUser } = useAuthStore();
    const { selectedUserId } = useChatStore();

    return (
        <>
            <aside
                className={`md:w-1/3 lg:w-1/4 w-full bg-white overflow-y-auto scroll-smooth no-scrollbar rounded-2xl md:rounded-none md:rounded-l-4xl md:block dark:bg-zinc-950 dark:text-white z-10 ${
                    selectedUserId ? "hidden md:block" : "block"
                }`}
            >
                {/* Top Bar */}
                <SidebarHeader user={currentUser} handleLogout={handleLogout} />

                {/* Search Bar */}
                <SearchUsersInput />

                {/* Chat List */}
                <ConversationList />
            </aside>
        </>
    );
};

export default Sidebar;
