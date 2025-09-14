import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

function UserPosts({ posts }) {
  return (
    <Row className="g-2">
      {posts?.map((post) => (
        <Col key={post._id} xs={4}>
          <Card>
            <Link to={`/posts/${post._id}`}>
              <Card.Img
                variant="top"
                src={post.image}
                alt="Post image"
                className="img-fluid"
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "cover",
                }}
              />
            </Link>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export default UserPosts;
