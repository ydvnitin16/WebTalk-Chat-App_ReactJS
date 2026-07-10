import Conversation from "./models/conversation.js";
import User from "./models/user.js";
import ConversationMember from "./models/conversationMember.js";
import Message from "./models/message.js";
import Call from "./models/call.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const users = [
  {
    _id: "687100000000000000000001",
    name: "Nitin Yadav",
    username: "nitin",
    bio: "Building SendX 🚀",
    avatar: { url: "avatar1.png", public_id: "av1" },
    email: "nitin@example.com",
    password: "hashed_password",
    isOnline: true,
    lastSeen: null,
  },
  {
    _id: "687100000000000000000002",
    name: "Rahul Sharma",
    username: "rahul",
    bio: "Coffee addict",
    avatar: { url: "avatar2.png", public_id: "av2" },
    email: "rahul@example.com",
    password: "hashed_password",
    isOnline: false,
    lastSeen: "2026-07-05T14:15:00Z",
  },
  {
    _id: "687100000000000000000003",
    name: "Priya Singh",
    username: "priya",
    bio: "Frontend Developer",
    avatar: { url: "avatar3.png", public_id: "av3" },
    email: "priya@example.com",
    password: "hashed_password",
    isOnline: true,
    lastSeen: null,
  },
  {
    _id: "687100000000000000000004",
    name: "Amit Kumar",
    username: "amit",
    bio: "Backend Engineer",
    avatar: { url: "avatar4.png", public_id: "av4" },
    email: "amit@example.com",
    password: "hashed_password",
    isOnline: false,
    lastSeen: "2026-07-05T13:45:00Z",
  },
];

const conversations = [
  {
    _id: "687200000000000000000001",
    participants: ["687100000000000000000001", "687100000000000000000002"],
    lastMessageId: "687400000000000000000004",
    lastActivity: "2026-07-05T14:30:00Z",
  },
  {
    _id: "687200000000000000000002",
    participants: ["687100000000000000000001", "687100000000000000000003"],
    lastMessageId: "687400000000000000000008",
    lastActivity: "2026-07-05T14:40:00Z",
  },
  {
    _id: "687200000000000000000003",
    participants: ["687100000000000000000002", "687100000000000000000004"],
    lastMessageId: "687400000000000000000012",
    lastActivity: "2026-07-05T12:10:00Z",
  },
];

const conversationMembers = [
  {
    _id: "687300000000000000000001",
    conversationId: "687200000000000000000001",
    userId: "687100000000000000000001",
    unreadCount: 0,
    lastSeenMessageId: "687400000000000000000004",
    lastDeliveredMessageId: "687400000000000000000004",
  },
  {
    _id: "687300000000000000000002",
    conversationId: "687200000000000000000001",
    userId: "687100000000000000000002",
    unreadCount: 0,
    lastSeenMessageId: "687400000000000000000004",
    lastDeliveredMessageId: "687400000000000000000004",
  },

  {
    _id: "687300000000000000000003",
    conversationId: "687200000000000000000002",
    userId: "687100000000000000000001",
    unreadCount: 0,
    lastSeenMessageId: "687400000000000000000008",
    lastDeliveredMessageId: "687400000000000000000008",
  },
  {
    _id: "687300000000000000000004",
    conversationId: "687200000000000000000002",
    userId: "687100000000000000000003",
    unreadCount: 1,
    lastSeenMessageId: "687400000000000000000007",
    lastDeliveredMessageId: "687400000000000000000008",
  },

  {
    _id: "687300000000000000000005",
    conversationId: "687200000000000000000003",
    userId: "687100000000000000000002",
    unreadCount: 0,
    lastSeenMessageId: "687400000000000000000012",
    lastDeliveredMessageId: "687400000000000000000012",
  },
  {
    _id: "687300000000000000000006",
    conversationId: "687200000000000000000003",
    userId: "687100000000000000000004",
    unreadCount: 2,
    lastSeenMessageId: "687400000000000000000010",
    lastDeliveredMessageId: "687400000000000000000012",
  },
];

const messages = [
  {
    _id: "687400000000000000000001",
    conversationId: "687200000000000000000001",
    senderId: "687100000000000000000001",
    content: "Hey Rahul!",
    type: "text",
  },
  {
    _id: "687400000000000000000002",
    conversationId: "687200000000000000000001",
    senderId: "687100000000000000000002",
    content: "Hi Nitin 👋",
    type: "text",
  },
  {
    _id: "687400000000000000000003",
    conversationId: "687200000000000000000001",
    senderId: "687100000000000000000001",
    content: "Working on SendX?",
    type: "text",
  },
  {
    _id: "687400000000000000000004",
    conversationId: "687200000000000000000001",
    senderId: "687100000000000000000002",
    content: "Yes 😄",
    type: "text",
  },

  {
    _id: "687400000000000000000005",
    conversationId: "687200000000000000000002",
    senderId: "687100000000000000000003",
    content: "Morning!",
    type: "text",
  },
  {
    _id: "687400000000000000000006",
    conversationId: "687200000000000000000002",
    senderId: "687100000000000000000001",
    content: "Morning Priya",
    type: "text",
  },
  {
    _id: "687400000000000000000007",
    conversationId: "687200000000000000000002",
    senderId: "687100000000000000000003",
    content: "Ready for deployment?",
    type: "text",
  },
  {
    _id: "687400000000000000000008",
    conversationId: "687200000000000000000002",
    senderId: "687100000000000000000001",
    content: "Almost done.",
    type: "text",
  },

  {
    _id: "687400000000000000000009",
    conversationId: "687200000000000000000003",
    senderId: "687100000000000000000004",
    content: "Server restarted.",
    type: "text",
  },
  {
    _id: "687400000000000000000010",
    conversationId: "687200000000000000000003",
    senderId: "687100000000000000000002",
    content: "Thanks!",
    type: "text",
  },
  {
    _id: "687400000000000000000011",
    conversationId: "687200000000000000000003",
    senderId: "687100000000000000000004",
    content: "Logs look good.",
    type: "text",
  },
  {
    _id: "687400000000000000000012",
    conversationId: "687200000000000000000003",
    senderId: "687100000000000000000002",
    content: "Perfect.",
    type: "text",
  },
];

const calls = [
  {
    _id: "687500000000000000000001",
    conversationId: "687200000000000000000001",
    callerId: "687100000000000000000001",
    receiverId: "687100000000000000000002",
    type: "video",
    status: "completed",
    startedAt: "2026-07-05T10:00:00Z",
    endedAt: "2026-07-05T10:12:00Z",
  },
  {
    _id: "687500000000000000000002",
    conversationId: "687200000000000000000002",
    callerId: "687100000000000000000003",
    receiverId: "687100000000000000000001",
    type: "audio",
    status: "missed",
    startedAt: "2026-07-05T13:20:00Z",
    endedAt: null,
  },
  {
    _id: "687500000000000000000003",
    conversationId: "687200000000000000000003",
    callerId: "687100000000000000000002",
    receiverId: "687100000000000000000004",
    type: "video",
    status: "rejected",
    startedAt: "2026-07-05T11:15:00Z",
    endedAt: null,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  console.log("Connected");

  // Insert Users
  await User.insertMany(users);

  // Insert Conversations
  await Conversation.insertMany(conversations);

  // Insert Members
  await ConversationMember.insertMany(conversationMembers);

  // Insert Messages
  await Message.insertMany(messages);

  // Insert Calls
  await Call.insertMany(calls);

  console.log("Database Seeded");

  mongoose.disconnect();
}

seed();
