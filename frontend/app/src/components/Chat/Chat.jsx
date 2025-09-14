import React, { useState, useEffect } from "react";
import { Form, Button, ListGroup } from "react-bootstrap";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import Loader from "../Loader";
import Message from "../Message";

const ENDPOINT = 'http://localhost:5000';
let socket;

function Chat() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messageContent, setMessageContent] = useState('');


  useEffect(() => {
    socket = io(ENDPOINT);

    socket.emit('joinChat', chatId);

    socket.on('receiveMessage', (message) => {
      // console.log('Message received:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [chatId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get(`/api/chat/${chatId}`, config);
      setMessages(data); // Assuming data contains the array of messages
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.response && error.response.data.message ? error.response.data.message : error.message);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [chatId]);

  console.log(messages)

  const submitMessageHandler = async (e) => {
    e.preventDefault();
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post(`/api/chat/${chatId}/message`, { content: messageContent }, config);
      const lastMessage = data.messages[data.messages.length - 1]; // Get the last message
 
      socket.emit('sendMessage', { chatId,  "content":lastMessage.content});
      setMessageContent('');
    } catch (error) {
      setError(error.response && error.response.data.message ? error.response.data.message : error.message);
    }
  };

  return (
    <div className="mt-3">
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <ListGroup>
          {messages?.map((message) => (
            <ListGroup.Item key={message._id}>
         <strong>{message?.sender?.username}</strong> :
              {message?.content}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
      <Form onSubmit={submitMessageHandler}>
        <Form.Group>
          <Form.Control
            type="text"
            placeholder="Type a message..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
          />
        </Form.Group>
        <Button type="submit" variant="primary" className="mt-2">
          Send
        </Button>
      </Form>
    </div>
  );
}

export default Chat;
