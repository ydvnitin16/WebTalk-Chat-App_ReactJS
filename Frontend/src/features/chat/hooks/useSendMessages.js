import { socket } from "@/lib/socket";
import useAuthStore from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useState } from "react";

const useSendMessages = () => {
    const { addMessage, selectedUser } = useChatStore();
    const { currentUser } = useAuthStore();

    const [message, setMessage] = useState("");

    function sendMessage() {
        const sender = currentUser?.id;
        const receiver = selectedUser._id;
        const content = message;
        const createdAt = new Date();

        const messageObj = {
            content,
            sender,
            receiver,
            createdAt,
            type: "text",
            status: "sent",
        };

        // add to store
        addMessage(messageObj);
        setMessage("");

        socket.emit("message", { content, sender, sendTo: receiver });
    }

    return { sendMessage, message, setMessage };
};

export default useSendMessages;
