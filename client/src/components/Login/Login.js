import React, { Fragment, useState} from "react";
import "antd/dist/antd.css";
import "./Login.css";
import { Form, Input, Button, Select, Alert } from "antd";
import {
  UserOutlined,
  LockOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { Link } from 'react-router-dom'
import { loginWithEmailAndPassword } from "../../models/User";

function Login() {
  const { Option } = Select;
  const [errorSubmitCheck, setErrorSubmitCheck] = useState(false);
  const [ errorMsg, setErrorMsg ] = useState("");

  const loginSubmitHandler = (inputs) => {
    setErrorSubmitCheck(false);
    loginWithEmailAndPassword(inputs).then((user) => {
      //Insert user into local storage
      localStorage.setItem('loggedInUser', user);

      //localStorage.getItem('Name');
      //localStorage.removeItem('Name');
    }).catch((e) => {
      setErrorSubmitCheck(true);
      setErrorMsg(e);
    })
  }

  return (
    <Fragment>
      <Form
        name="loginForm"
        className="loginForm"
        onFinish={loginSubmitHandler}
      >
        <img src="cc-logo.png" className="ccLogo"/>
        <Form.Item
          name="email"
          className="email"
          rules={[{ required: true, message: "Please input your email" }]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="Email"
          />
        </Form.Item>
        <Form.Item
          name="password"
          className="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="Password"
          />
        </Form.Item>
        <Form.Item name="role" className="role">
          <Select
            placeholder={
              <React.Fragment>
                <UserSwitchOutlined/>
                &nbsp; Please select a role
              </React.Fragment>
            }
            // onChange={handleChange}
          >
            <Option value="student">Student</Option>
            <Option value="institution">Institution</Option>
            <Option value="employer">Employer</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="submitBtn">
            Login
          </Button>
          Or <Link to={"/register"} className="nav-link">Register!</Link>
        </Form.Item>

        {errorSubmitCheck &&
        <Form.Item>
          <Alert message={errorMsg} type="error" /> 
        </Form.Item>}
      </Form>
    </Fragment>
  );
}

export default Login;
