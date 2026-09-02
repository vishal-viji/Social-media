import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';
import PostForm from '../components/Posts/PostForm';
import PostList from '../components/Posts/PostList';
import { useNavigate, Link } from "react-router-dom";
import Profile from './Profile';

function Home() {
  const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [message, setMessage] = useState("");
    const handleClose = () => setMessage("");
    const [posts, setPosts] = useState([]);
    const [chats,setChats] = useState([])
    // Separate loading flag just for the very first load of the page,
    // so starting a chat or other actions elsewhere don't blank out the feed.
    const [initialLoading, setInitialLoading] = useState(true);


const startChartHandler = async (userId)=>{
  try{
    const userInfo=JSON.parse(localStorage.getItem('userInfo'))
    const config = {
      headers: {
        'Content-Type':'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const {data} = await axios.post('/api/chat',{userId},config);
    navigate(`/chat/${data._id}`);

  }
  catch (error) {
    setError(error.response && error.response.data.message ? error.response.data.message : error.message);
  }
}

const fetchChats = async ()=>{
  try{
    const userInfo=JSON.parse(localStorage.getItem('userInfo'))
    const config = {
      headers: {
      
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const {data} = await axios.get('/api/chat',config);
    setChats(data);
  
  }
  catch (error) {
    setError(error.response && error.response.data.message ? error.response.data.message : error.message);
  }
}



    const fetchPosts = async()=>{
      try{
        const userInfo=JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const {data} = await axios.get('/api/posts',config);
        setPosts(data);
      }
      catch (error) {
        setError(error.response && error.response.data.message ? error.response.data.message : error.message);
      } finally {
        setInitialLoading(false);
      }
    }

    useEffect(()=>{
    

        const userInfo = localStorage.getItem("userInfo");
        
        if (!userInfo) {
          navigate("/login");
          return;
        }
      fetchPosts();
      fetchChats();
      
    },[])

    


  return (
<Container>

    <Row>
        <Col md={3}>
        </Col>
        <Col md={6}>
        <h3 className="text-center bg-light text-dark mt-2">Upload Posts</h3>
        <PostForm   fetchPosts={  fetchPosts } />
        <hr />

        {error && (
          <Message variant="danger" onClose={() => setError(null)}>
            {error}
          </Message>
        )}

        {initialLoading ? (
          <div className="text-center my-5">
            <Loader />
            <p className="mt-2 text-muted">Loading posts...</p>
          </div>
        ) : (
          <PostList posts={posts} fetchPosts={fetchPosts} startChartHandler={startChartHandler}/>
        )}
        </Col>




        <Col md={3}>
        </Col>
    </Row>
</Container>
  )
}

export default Home
