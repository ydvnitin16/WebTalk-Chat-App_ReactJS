import React, { lazy, Suspense, useState } from "react";
import { LogOut, UserRound } from "lucide-react";
import { optimizeUrl } from "@/utils/imageOptimization.js";
import ModalSkeleton from "@/components/skeletons/ModalSkeleton.jsx";

const ProfileModal = lazy(
  () => import("@/features/auth/pages/ProfileModal.jsx"),
);
const ConfirmModal = lazy(
  () => import("../../../components/ui/ConfirmModal.jsx"),
);

const SidebarHeader = ({ user, handleLogout }) => {
  const [logoutModal, setLogoutModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState();

  return (
    <>
      {isProfileModalOpen && (
        <Suspense fallback={<ModalSkeleton />}>
          <ProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            user={user}
          />
        </Suspense>
      )}
      {logoutModal && (
        <Suspense fallback={<ModalSkeleton />}>
          <ConfirmModal
            isOpen={logoutModal}
            onClose={() => setLogoutModal(false)}
            onConfirm={handleLogout}
            title="Confirm Logout"
            description="Are you sure you want to logout?"
            actionTitle={"Yes, Logout"}
          />
        </Suspense>
      )}

      <div className="flex justify-between items-center px-3 pt-3 pb-1.5 dark:text-white">
        <div></div>
        <h1 className="flex gap-1 items-center text-2xl font-bold">
          <div
            className="w-10 h-10 bg-black dark:bg-white "
            style={{
              WebkitMaskImage: "url('/sendx-icon-dark.png')",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskSize: "contain",
              maskImage: "url('/sendx-icon-dark.png')",
              maskRepeat: "no-repeat",
              maskSize: "contain",
            }}
          />
          chats
        </h1>
        <div className="relative">
          <img
            loading="lazy"
            src={optimizeUrl(user?.avatar?.url || user?.avatar, "small")}
            alt={user?.name}
            className="w-10 h-10 object-cover rounded-full cursor-pointer"
            onClick={() => setShowDropdown(!showDropdown)}
          />
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white  rounded-lg z-50 shadow-md dark:bg-black">
              <ul className="text-md text-zinc-700 dark:text-zinc-300 ">
                <li
                  onClick={() => {
                    setIsProfileModalOpen(true);
                    setShowDropdown(false);
                  }}
                  className="flex gap-2.5 px-2.5 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg cursor-pointer"
                >
                  <UserRound size={24} />
                  Profile
                </li>
                <hr className="text-zinc-200 dark:text-zinc-900 w-full" />
                <li
                  onClick={() => {
                    setLogoutModal(true);
                    setShowDropdown(false);
                  }}
                  className="flex gap-2.5 px-2.5 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg cursor-pointer"
                >
                  <LogOut size={24} /> Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SidebarHeader;
