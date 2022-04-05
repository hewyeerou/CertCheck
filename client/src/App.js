import React, { useState, useEffect } from "react";
import {
  Route,
  BrowserRouter,
  Routes,
  Navigate,
} from "react-router-dom";
import { message } from "antd";
import getWeb3 from "./getWeb3";

import "./App.css";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Page from "./components/Page";

import CertificateNetwork from './contracts/CertificateNetwork.json';
import Certificate from './contracts/Certificate.json';

import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

function App() {
  // initialize the state variables of the application
  const [storageValue, setStorageValue] = useState(0);
  const [web3, setWeb3] = useState();
  const [accounts, setAccounts] = useState();
  const [certNetworkContract, setCertNetworkContract] = useState();
  const [deployedCertNetwork, setDeployedCertNetwork] = useState();
  const [certContract, setCertContract] = useState();

  const antIcon = <LoadingOutlined style={{ fontSize: 50, textAlign: "center", marginTop: "10px" }} spin />;

  const loadWeb3 = async () => {
    try {
      const web3 = await getWeb3();
      console.log("********** web3: ", web3);

      const accounts = await web3.eth.getAccounts();
      console.log("********** accounts: ", accounts);

      const networkId = await web3.eth.net.getId();
      const deployedCertNetwork = CertificateNetwork.networks[networkId];
      const certNetworkInstance = new web3.eth.Contract(
        CertificateNetwork.abi,
        deployedCertNetwork && deployedCertNetwork.address
      );

      const deployedCert = Certificate.networks[networkId];
      const certInstance = new web3.eth.Contract(
        Certificate.abi,
        deployedCert && deployedCert.address
      );

      console.log("######### deployedCertNetwork", deployedCertNetwork);
      console.log("######### certNetworkInstance", certNetworkInstance);

      console.log("######### deployedCert", deployedCert);
      console.log("######### certInstance", certInstance);

      setWeb3(web3);
      setAccounts(accounts);
      setCertNetworkContract(certNetworkInstance);
      setDeployedCertNetwork(deployedCertNetwork);
      setCertContract(certInstance);
      console.log(certContract);
    } catch (error) {
      message.error(`Failed to load web3.`);
      console.error(error);
    }
  };

  useEffect(() => {
    loadWeb3();
  }, []);

  if (typeof web3 === "undefined") {
    return (
      <div className="App">
        <Spin indicator={antIcon} />
      </div>
    );
  }

  // equivalent to the render function of older React frameworks
  return (
    <BrowserRouter>
      <Routes>
        <Route index path="/" element={<Login web3={web3} accounts={accounts} />} />
        <Route
          path="/register"
          element={
            <Register
              web3={web3}
              accounts={accounts}
              certNetworkContract={certNetworkContract}
            />
          }
        />
        <Route
          path="/student/viewCert"
          element={<Page pageType={"/student/viewCert"} certContract={certContract} />}
        />
        <Route
          path="/student/viewReq"
          element={<Page pageType={"/student/viewReq"} certContract={certContract} />}
        />
        <Route
          path="/student/viewVer"
          element={<Page pageType={"/student/viewVer"} certContract={certContract} accounts={accounts} />}
        />

        <Route
          path="/verifier/viewStudentCert"
          element={<Page pageType={"/verifier/viewStudentCert"}  certContract={certContract} accounts={accounts}  />}
        />
        <Route
          path="/issuer/viewRequests"
          element={<Page pageType={"/issuer/viewRequests"} certContract={certContract} />}
        />
        <Route
          path="/issuer/viewIssued"
          element={<Page pageType={"/issuer/viewIssued"} certContract={certContract} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;