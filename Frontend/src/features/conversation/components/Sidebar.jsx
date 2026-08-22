import React from "react";
import SearchUsersInput from "./SearchUsersInput";
import SidebarHeader from "./SidebarHeader";
import ConversationList from "./ConversationList";
import useLogout from "@/features/auth/hooks/useLogout";
import useAuthStore from "@/stores/useAuthStore";
import useMessageStore from "@/stores/useMessageStore";

const Sidebar = () => {
  const { handleLogout } = useLogout();
  const { currentUser } = useAuthStore();
  const { activeConversationId } = useMessageStore();

  return (
    <>
      <aside
        className={`md:w-1/3 lg:w-1/4 h-full w-full bg-[#FCFCFC] overflow-y-auto scroll-smooth no-scrollbar dark:bg-black dark:text-white z-10 ${
          activeConversationId ? "hidden md:block" : "block"
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
