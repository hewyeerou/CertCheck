import React, { Fragment, useEffect, useState } from "react";
import { Form, Select, Input, Button } from "antd";
import "antd/dist/antd.css";
import "./Register.css";
import { Link } from "react-router-dom";

//web3
import getWeb3 from '../../getWeb3';

function Register() {
  const { Option } = Select;

  // set up web3
  const [web3, setWeb3] = useState();
  const [accounts, setAccounts] = useState();
  const [contract, setContract] = useState();

  const loadWeb3 = async() => {
    try {
        const web3 = await getWeb3();
        console.log("********** web3: ", web3);

        const accounts = await web3.eth.getAccounts();
        console.log("********** accounts: ", accounts);

        const networkId = await web3.eth.net.getId();
        console.log("********** network id: ", networkId);

        
    } catch {
        
    }
  }

  useEffect(() => {

  }, []);

  const onSubmit = (values) => {
    console.log("Success", values);
  };

  return (
    <Fragment>
      <div className="registerContainer">
        <img src="cc-logo.png" className="ccLogo" />
        <Form
          className="registerForm"
          labelAlign="left"
          labelCol={{ span: 8 }}
          onFinish={onSubmit}
        >
          <h1>Register</h1>
          <Form.Item
            label="Role"
            name="role"
            className="role"
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select placeholder="Please select a role">
              <Option value="student">Student</Option>
              <Option value="institution">Institution</Option>
              <Option value="employer">Employer</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Wallet Address"
            name="walletAddress"
            className="walletAddress"
            rules={[{ required: true, message: "Please enter wallet address" }]}
          >
            <Input type="text" placeholder="Wallet Address" />
          </Form.Item>

          <Form.Item
            label="Name"
            name="name"
            className="name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input type="text" placeholder="Name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            className="email"
            rules={[{ required: true, message: "Please enter your email" }]}
          >
            <Input type="email" placeholder="Email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            className="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input type="password" placeholder="Password" />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirm"
            className="confirm"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      "The two passwords that you entered do not match!"
                    )
                  );
                },
              }),
            ]}
          >
              <Input type="password" placeholder="Please re-enter your password"/>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="registerBtn">
              Register
            </Button>

            <label>Back to </label>
            <Link to={"/"} className="nav-link">
              Login!
            </Link>
          </Form.Item>
        </Form>
      </div>
    </Fragment>
  );
}

export default Register;
