import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './components/Header';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Profile from './Pages/Profile';
import Home from './Pages/Home';
import Chat from './components/Chat/Chat';
import ChatList from './components/Chat/ChatList';

function App() {
  return (
    <Router>
      <Header />
      <Container>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chats" element ={<ChatList/>} />
          <Route path="/chat/:chatId" element ={<Chat/>} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
