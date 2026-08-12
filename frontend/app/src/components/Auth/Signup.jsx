import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  InputGroup,
  Card,
} from "react-bootstrap";
import Loader from "../Loader";
import Message from "../Message";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = location.search ? location.search.split("=")[1] : "/profile";
  const [messsage, setMessage] = useState("");
  const [show, changeshow] = useState("fa fa-eye-slash");
  const handleClose = () => setMessage("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formValues, setFormValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmpassword: "",
    termsAccepted: false,
  });

  const [formErrors, setFormErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmpassword: "",
    termsAccepted: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormValues({
      ...formValues,
      [name]: newValue,
    });
    validateField(name, newValue);
  };

  const getValidationClass = (name) => {
    if (formValues[name] === "") return "";
    return formErrors[name] ? "is-invalid" : "is-valid";
  };

  const clearForm = () => {
    setFormValues({
      username: "",
      email: "",
      password: "",
      confirmpassword: "",
      termsAccepted: false,
    });
  };

  const validateField = (name, value) => {
    let errorMessage = null;

    switch (name) {
      case "username":
        if (!value) {
          errorMessage = "This field is required...";
        }
        break;

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errorMessage = "Invalid email format..";
        }
        break;

      case "password":
        const minLength = 6;
        const passwordRegex =
          /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[_$@*!])[A-Za-z0-9_$@*!]{6,}$/;
        if (value.length < minLength || !passwordRegex.test(value)) {
          errorMessage =
            "Password must include atleast [1-9][a-z][A-z][_$@*!..] & 6 Characters";
        }
        break;

      case "confirmpassword":
        if (value !== formValues.password) {
          errorMessage = "Password do not match..";
        }
        break;

      case "termsAccepted":
        if (!value) {
          errorMessage = "You must accept the term and conditions..";
        }
        break;

      default:
        break;
    }

    setFormErrors({
      ...formErrors,
      [name]: errorMessage,
    });
  };

  const isFormValid = () => {
    return (
      Object.values(formErrors).every((error) => error === null) &&
      Object.values(formValues).every(
        (value) => value !== "" && value !== false
      )
    );
  };

  const showPassword = () => {
    var x = document.getElementById("pass1");
    var z = document.getElementById("pass2");
    if (x.type === "password" && z.type === "password") {
      x.type = "text";
      z.type = "text";
      changeshow(`fa fa-eye`);
    } else {
      x.type = "password";
      z.type = "password";
      changeshow(`fa fa-eye-slash`);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      setMessage("Please fill out the form correctly.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setError(null);

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post("/api/auth/signup", formValues, config);
      localStorage.setItem("userInfo", JSON.stringify(data));
      clearForm();
      window.location.reload();
      navigate(redirect);
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

  return (
    <>
      <Container>
        <Row>
          <Col md="4"></Col>

          {loading ? (
            <Loader />
          ) : (
            <Col md="4">
              <Card className="mt-4 p-3">
                <Form onSubmit={submitHandler}>
                  <br />
                  <h3 className="text-center bg-light text-dark">
                    Signup Here
                  </h3>
                  {messsage && (
                    <Message variant="success" onClose={handleClose}>
                      {messsage}
                    </Message>
                  )}

                  {error && (
                    <Message variant="danger" onClose={() => setError(null)}>
                      {error}
                    </Message>
                  )}

                  <Form.Group controlId="firstname">
                    <Form.Label>UserName</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter Username"
                      name="username"
                      value={formValues.username}
                      onChange={handleChange}
                      isInvalid={!!formErrors.username}
                      className={getValidationClass("username")}
                    />

                    <Form.Control.Feedback type="invalid">
                      {formErrors.username}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group controlId="email" className="mt-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your Email"
                      name="email"
                      value={formValues.email}
                      onChange={handleChange}
                      isInvalid={!!formErrors.email}
                      className={getValidationClass("email")}
                    ></Form.Control>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.email}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      {" "}
                      <span>
                        <i className={show}></i>
                      </span>{" "}
                      Password
                    </Form.Label>
                    <InputGroup className="mb-3">
                      <InputGroup.Checkbox onClick={showPassword} />{" "}
                      <Form.Control
                        required
                        type="password"
                        name="password"
                        id="pass1"
                        value={formValues.password}
                        placeholder="Enter your Password"
                        isInvalid={!!formErrors.password}
                        className={getValidationClass("password")}
                        onChange={handleChange}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.password}
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      {" "}
                      <span>
                        <i className={show}></i>
                      </span>{" "}
                      Confirm Password
                    </Form.Label>
                    <InputGroup className="mb-3">
                      <InputGroup.Checkbox onClick={showPassword} />{" "}
                      <Form.Control
                        required
                        type="password"
                        placeholder="Confirm Password"
                        name="confirmpassword"
                        value={formValues.confirmpassword}
                        onChange={handleChange}
                        id="pass2"
                        isInvalid={!!formErrors.confirmpassword}
                        className={getValidationClass("confirmpassword")}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.confirmpassword}
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mt-3">
                    <Form.Check
                      required
                      label="Agree to terms and conditions"
                      feedback="You must agree before submitting."
                      name="termsAccepted"
                      value={formValues.termsAccepted}
                      checked={formValues.termsAccepted}
                      onChange={handleChange}
                      isInvalid={!!formErrors.termsAccepted}
                      className={getValidationClass("termsAccepted")}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.termsAccepted}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Button
                    className="mt-3"
                    variant="success"
                    type="submit"
                    disabled={!isFormValid()}
                  >
                    Signup
                  </Button>
                </Form>
              </Card>

              <Row className="py-3">
                <Col>
                  Already User?
                  <Link to="/login">Login In</Link>
                </Col>
              </Row>
            </Col>
          )}
          <Col md="4"></Col>
        </Row>
      </Container>
    </>
  );
}

export default Signup;
