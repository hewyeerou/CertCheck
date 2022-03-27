import React, { Fragment, useState, useEffect } from "react";
import "antd/dist/antd.css";
import "./Login.css";
import { Form, Input, Button, Select, Alert } from "antd";
import getWeb3 from "../../getWeb3";
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
              if (result) {
                //Navigate to home page
                console.log(result);
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

  // useEffect(() => {
  //   const runExample = async () => {
  //     // example of interaction with the smart contract
  //     try {
  //       // Stores a given value, 5 by default
  //       await contract.methods.set(5).send({ from: accounts[0] });

  //       // Get the value from the contract to prove it worked
  //       const response = await contract.methods.get().call();

  //       // Update state with the result
  //       setStorageValue(response);
  //     }
  //     catch (error) {
  //       alert('No contract deployed or account error; please check that MetaMask is on the correct network, reset the account and reload page');
  //       console.error(error);
  //     }
  //   }
  //   if (typeof (web3) != 'undefined'
  //     && typeof (accounts) != 'undefined'
  //     && typeof (contract) != 'undefined') {
  //     runExample();
  //   }
  // }, [web3, accounts, contract]);

  if (typeof web3 === "undefined") {
    return (
      <div className="App">
        Loading Web3, accounts, and contract... Reload page
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Hello, World!</h1>
      {/* <p>Your account: {accounts[0]}</p> */}
    </div>
  );
}

export default Login;
