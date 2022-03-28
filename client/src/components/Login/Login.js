import React, { Fragment, useState, useEffect } from "react";
import "antd/dist/antd.css";
import "./Login.css";
import { Form, Input, Button, Select, Alert } from "antd";
import SimpleStorageContract from "../../contracts/SimpleStorage.json";
import {
  UserOutlined,
  LockOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { checkAddressExist } from "../../models/User";

function Login({ web3, accounts }) {
  const { Option } = Select;
  let navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        if (accounts) {
          checkAddressExist(accounts[0])
            .then((result) => {

              // *** stella, can remove this if you have another way to do it
              if (result) {
                localStorage.setItem("user", JSON.stringify(result));
                
                if(result.type === "Student") {
                  navigate("/student/viewCert");
                } else if (result.type === "Issuer") {
                  // navigate to issuer page
                } else {
                  navigate("/verifier/viewStudentCert");
                }
              } else {
                navigate("/register", {
                  state: {
                    walletAddress: accounts[0],
                  },
                });
              }
            })
            .catch((err) => {
              console.log(err);
            });
        }
      } catch (error) {
        // Catch any errors for any of the above operations
        alert(
          `Failed to load web3, accounts, or contract. Did you migrate the contract or install MetaMask? Check console for details.`
        );
        console.error(error);
      }
    };
    init();
  }, [accounts]);

  return (
    <div className="container">
      <h1>Hello, World!</h1>
      {/* <p>Your account: {accounts[0]}</p> */}
    </div>
  );
}

export default Login;
