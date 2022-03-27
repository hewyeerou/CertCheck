import React, { Fragment, useEffect, useState } from "react";
import { Form, Select, Input, Button, message } from "antd";
import "antd/dist/antd.css";
import "./Register.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { addUser } from "../../models/User";

function Register({ web3, accounts, certNetworkContract }) {
  const { Option } = Select;
  const [form] = Form.useForm();

  const navigate = useNavigate();
  const location = useLocation();
  const [walletAddress, setWalletAddress] = useState();

  useEffect(() => {
    setWalletAddress(location.state.walletAddress);
  }, []);

  const onSubmit = async (values) => {
    const { role, name, email, password } = values;

    // const res = await certNetworkContract.methods
    //   .checkUserExist(accounts[0], role)
    //   .call();
    console.log(accounts[0]);
    try {
      const res = await certNetworkContract.methods
        .register(accounts[0], role)
        .send({ from: accounts[0] });

      addUser(accounts[0], name, email, password, role, "").then(() => {
        message.success("Account has been created!");
        navigate("/");
      });

      console.log("######## Response", res);
    } catch (err) {
      let errorMessageInJson = JSON.parse(err.message.slice(58, err.message.length - 2) );
      let errorMessageToShow = errorMessageInJson.data.data[Object.keys(errorMessageInJson.data.data)[0]].reason;

      message.error(errorMessageToShow);
    }
  };

  if (typeof web3 === "undefined") {
    return (
      <div className="App">
        Loading Web3, accounts, and contract... Reload page
      </div>
    );
  }

  return (
    <Fragment>
      <div className="registerContainer">
        <img src="cc-logo.png" className="ccLogo" />
        <Form
          className="registerForm"
          labelAlign="left"
          labelCol={{ span: 8 }}
          onFinish={onSubmit}
          form={form}
        >
          <h1>Register</h1>
          <Form.Item
            label="Role"
            name="role"
            className="role"
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select placeholder="Please select a role">
              <Option value="Student">Student</Option>
              <Option value="Institution">Institution</Option>
              <Option value="Employer">Employer</Option>
            </Select>
          </Form.Item>

          {/* <Form.Item
            label="Wallet Address"
            name="walletAddress"
            className="walletAddress"
            // rules={[{ required: true, message: "Please enter wallet address" }]}
          >
            <Input type="text" placeholder="Wallet Address" disabled />
          </Form.Item> */}

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
            <Input
              type="password"
              placeholder="Please re-enter your password"
            />
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
