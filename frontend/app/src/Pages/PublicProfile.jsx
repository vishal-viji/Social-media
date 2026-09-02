import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";
import Message from "../components/Message";
import UserPosts from "../components/Posts/UserPosts";

const PLACEHOLDER_AVATAR = "https://via.placeholder.com/120?text=User";

function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentUserInfo = JSON.parse(localStorage.getItem("userInfo") || "null");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const config = {
        headers: { Authorization: `Bearer ${currentUserInfo.token}` },
      };

      const { data } = await axios.get(`/api/users/${id}`, config);
      setUser(data);

      const { data: postsData } = await axios.get(
        `/api/posts/user/${id}`,
        config
      );
      setUserPosts(postsData);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUserInfo) {
      navigate("/login");
      return;
    }
    // If someone navigates to their own id, just send them to the
    // full profile page (with edit/2FA/search) instead of the read-only view.
    if (id === currentUserInfo._id) {
      navigate("/profile");
      return;
    }
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isFollowing = user?.followers?.some(
    (follower) => follower?._id === currentUserInfo?._id
  );

  const followHandler = async () => {
    try {
      setActionLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${currentUserInfo.token}` },
      };
      const endpoint = isFollowing ? "unfollow" : "follow";
      await axios.post(`/api/users/${endpoint}/${id}`, {}, config);
      fetchProfile();
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    } finally {
      setActionLoading(false);
    }
  };

  const startChatHandler = async () => {
    try {
      setActionLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${currentUserInfo.token}` },
      };
      const { data } = await axios.post("/api/chat", { userId: id }, config);
      navigate(`/chat/${data._id}`);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Loader />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Message variant="danger" onClose={() => setError(null)}>
          {error}
        </Message>
      </Container>
    );
  }

  if (!user) return null;

  return (
    <Container>
      <Row>
        <Col md="4">
          <Card className="mt-4 p-3 text-center">
            <img
              src={user.profilePicture || PLACEHOLDER_AVATAR}
              alt={user.username}
              className="rounded-circle mx-auto"
              width="120"
              height="120"
              style={{ objectFit: "cover" }}
            />
            <h4 className="mt-3">{user.username}</h4>

            <div className="d-flex justify-content-center gap-4 my-3">
              <div>
                <strong>{user.followers?.length || 0}</strong>
                <div className="text-muted small">Followers</div>
              </div>
              <div>
                <strong>{user.following?.length || 0}</strong>
                <div className="text-muted small">Following</div>
              </div>
            </div>

            <div className="d-flex gap-2 justify-content-center">
              <Button
                variant={isFollowing ? "outline-secondary" : "success"}
                onClick={followHandler}
                disabled={actionLoading}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
              <Button
                variant="light"
                onClick={startChatHandler}
                disabled={actionLoading}
              >
                Chat
              </Button>
            </div>
          </Card>
        </Col>

        <Col md="8">
          <Card className="mt-4 p-3">
            <h5 className="text-center bg-light p-2">
              {user.username}'s Posts
            </h5>
            {userPosts.length === 0 ? (
              <p className="text-center text-muted my-4">
                No posts yet.
              </p>
            ) : (
              <UserPosts posts={userPosts} />
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default PublicProfile;
