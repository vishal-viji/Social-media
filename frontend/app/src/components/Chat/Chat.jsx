import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { useParams, Link } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import Loader from "../Loader";
import Message from "../Message";

const ENDPOINT = 'https://social-media-backend-2zm2.onrender.com';
const PLACEHOLDER_AVATAR = "https://via.placeholder.com/40?text=U";
let socket;

function Chat() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [messageContent, setMessageContent] = useState('');
  const messagesEndRef = useRef(null);

  const currentUserInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    socket = io(ENDPOINT);

    socket.emit('joinChat', chatId);

    socket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [chatId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${currentUserInfo.token}`,
        },
      };

      const { data } = await axios.get(`/api/chat/${chatId}`, config);
      setMessages(data);

      // The messages endpoint doesn't include the chat's participants, so
      // grab that from the chat list to show who we're talking to.
      const { data: allChats } = await axios.get('/api/chat', config);
      const thisChat = allChats.find((c) => c._id === chatId);
      if (thisChat) {
        const other = thisChat.users.find(
          (u) => u._id !== currentUserInfo._id
        );
        setOtherUser(other);
      }
    } catch (error) {
      setError(error.response && error.response.data.message ? error.response.data.message : error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  const submitMessageHandler = async (e) => {
    e.preventDefault();
    if (!messageContent.trim()) return;
    try {
      setSending(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUserInfo.token}`,
        },
      };

      const { data } = await axios.post(`/api/chat/${chatId}/message`, { content: messageContent }, config);
      const lastMessage = data.messages[data.messages.length - 1];

      // Show it in our own window immediately.
      setMessages((prev) => [...prev, lastMessage]);

      // Send the full message (with sender info) so the other person's
      // window can show the sender's name/avatar correctly too, instead of
      // just raw text.
      socket.emit('sendMessage', {
        chatId,
        message: {
          ...lastMessage,
          sender: {
            _id: currentUserInfo._id,
            username: currentUserInfo.username,
            profilePicture: currentUserInfo.profilePicture,
          },
        },
      });
      setMessageContent('');
    } catch (error) {
      setError(error.response && error.response.data.message ? error.response.data.message : error.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Loader />
      </div>
    );
  }

  return (
    <div className="mt-3 d-flex flex-column" style={{ height: "75vh" }}>
      {/* Header showing who you're chatting with */}
      <div className="d-flex align-items-center border-bottom pb-2 mb-2">
        {otherUser && (
          <Link to={`/user/${otherUser._id}`} className="d-flex align-items-center text-decoration-none text-dark">
            <img
              src={otherUser.profilePicture || PLACEHOLDER_AVATAR}
              alt={otherUser.username}
              className="rounded-circle me-2"
              style={{ width: "36px", height: "36px", objectFit: "cover" }}
            />
            <strong>{otherUser.username}</strong>
          </Link>
        )}
      </div>

      {error && <Message variant="danger" onClose={() => setError(null)}>{error}</Message>}

      {/* Scrollable message area */}
      <div
        className="flex-grow-1 overflow-auto p-2"
        style={{ backgroundColor: "#f0f2f5", borderRadius: "8px" }}
      >
        {messages.length === 0 ? (
          <p className="text-center text-muted mt-4">
            No messages yet. Say hello!
          </p>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message?.sender?._id === currentUserInfo._id;
            return (
              <div
                key={message._id || index}
                className={`d-flex mb-2 ${isOwnMessage ? "justify-content-end" : "justify-content-start"}`}
              >
                {!isOwnMessage && (
                  <img
                    src={message?.sender?.profilePicture || PLACEHOLDER_AVATAR}
                    alt={message?.sender?.username || "User"}
                    className="rounded-circle me-2 align-self-end"
                    style={{ width: "28px", height: "28px", objectFit: "cover" }}
                  />
                )}
                <div
                  style={{
                    maxWidth: "65%",
                    padding: "8px 12px",
                    borderRadius: "16px",
                    backgroundColor: isOwnMessage ? "#0d6efd" : "#ffffff",
                    color: isOwnMessage ? "#fff" : "#000",
                    boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
                  }}
                >
                  {!isOwnMessage && (
                    <div className="small fw-bold mb-1">
                      {message?.sender?.username || "Unknown user"}
                    </div>
                  )}
                  <div>{message.content}</div>
                  {message.timestamp && (
                    <div
                      className="text-end mt-1"
                      style={{
                        fontSize: "0.7rem",
                        opacity: 0.7,
                      }}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <Form onSubmit={submitMessageHandler} className="d-flex mt-2 gap-2">
        <Form.Control
          type="text"
          placeholder="Type a message..."
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
        />
        <Button type="submit" variant="primary" disabled={sending || !messageContent.trim()}>
          {sending ? <Spinner animation="border" size="sm" /> : "Send"}
        </Button>
      </Form>
    </div>
  );
}

export default Chat;
