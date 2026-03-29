import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FiMessageCircle, FiX } from "react-icons/fi";
import axiosInstance from "./AuthenticationPages/axiosConfig";

const ChatBot = () => {
    const [chatInput, setChatInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const chatEndRef = useRef(null);

    const handleSend = async () => {
        if (!chatInput.trim()) return;

        const userMessage = { from: "user", text: chatInput };
        setMessages((prev) => [...prev, userMessage]);
        setChatInput("");
        setLoading(true);

        try {
            const res = await axiosInstance.post(`/chat/`, {
                message: userMessage.text,
            });
            const botReply = res.data.response || "🤖 Sorry, I couldn't respond.";
            const botMessage = { from: "bot", text: botReply };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    from: "bot",
                    text: "❌ Unable to connect to the chatbot. Please try again later.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {isOpen ? (
                <div className="w-80 bg-white shadow-lg rounded-lg flex flex-col border border-green-700">
                    <div className="flex justify-between items-center bg-green-700 text-white px-4 py-2">
                        <h2 className="text-sm font-semibold">Greenbazzar AI-Assistant</h2>
                        <button onClick={() => setIsOpen(false)}><FiX size={18} /></button>
                    </div>
                    <div className="p-2 h-72 overflow-y-auto text-sm bg-gray-50">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`my-1 px-3 py-2 rounded-lg max-w-[80%] ${msg.from === "user"
                                        ? "bg-green-100 ml-auto text-right"
                                        : "bg-white text-left"
                                    }`}
                            >
                                {msg.text}
                            </div>
                        ))}
                        {loading && <div className="text-gray-500 italic">Bot is typing...</div>}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="flex border-t">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Type a message..."
                            className="flex-1 p-2 text-sm border-none focus:outline-none"
                            disabled={loading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading}
                            className={`px-4 ${loading ? "bg-green-400" : "bg-green-700 hover:bg-green-800"} text-white text-sm`}
                        >
                            Send
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    className="bg-green-700 hover:bg-green-800 text-white p-3 rounded-full shadow-lg"
                    onClick={() => setIsOpen(true)}
                >
                    <img src="https://cdn-icons-png.freepik.com/256/1698/1698535.png" alt="Chat" className="w-6 h-6" />
                </button>
            )}
        </div>
    );
};

export default ChatBot;
