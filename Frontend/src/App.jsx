import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";
import router from "./routes.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import { useEffect } from "react";
import useConversationStore from "./stores/useConversationStore.js";
import useMemberStore from "./stores/useMemberStore.js";
import useMessageStore from "./stores/useMessageStore.js";

function App() {
  // const { conversations, getById } = useConversationStore();
  // const { users, membersCursor } = useMemberStore();
  // const { activeConversationId, messages } = useMessageStore();

  // useEffect(() => {
  //   const conversation = getById(activeConversationId);
  //   const user = users[conversation?.otherUserId];
  //   console.log("Selected Conversation: ", conversation);
  //   console.log("Conversations: ", conversations);
  //   console.log("Other User: ", user);
  //   console.log("Users: ", users);
  //   console.log("Active Conversation Id: ", activeConversationId);
  //   console.log("Members Cursor: ", membersCursor);
  //   console.log("Messages: ", messages);
  // }, [
  //   conversations,
  //   getById,
  //   users,
  //   membersCursor,
  //   activeConversationId,
  //   messages,
  // ]);

  return (
    <div>
      <Toaster position="top-right" />
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </div>
  );
}

export default App;
