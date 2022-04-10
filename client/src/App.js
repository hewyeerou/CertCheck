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
import CertificateStore from './contracts/CertificateStore.json';
import Certificate from './contracts/Certificate.json';

import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import ReloadLogin from "./components/ReloadLogin";

function App() {
  // initialize the state variables of the application
  const [storageValue, setStorageValue] = useState(0);
  const [web3, setWeb3] = useState();
  const [accounts, setAccounts] = useState();
  const [certNetworkContract, setCertNetworkContract] = useState();
  const [certStoreContract, setCertStoreContract] = useState();
  const [certContract, setCertContract] = useState();

  const antIcon = <LoadingOutlined style={{ fontSize: 50, textAlign: "center", marginTop: "10px" }} spin />;

  const loadWeb3 = async () => {
    try {
      const web3 = await getWeb3();
      console.log("********** web3: ", web3);

      const accounts = await web3.eth.getAccounts();
      console.log("********** accounts: ", accounts);

      // deploy certificate network 
      const networkId = await web3.eth.net.getId();
      const deployedCertNetwork = CertificateNetwork.networks[networkId];
      const certNetworkInstance = new web3.eth.Contract(
        CertificateNetwork.abi,
        deployedCertNetwork && deployedCertNetwork.address
      );

      // deploy certificate store
      const deployedCertStore = CertificateStore.networks[networkId];
      const certStoreInstance = new web3.eth.Contract(
        CertificateStore.abi,
        deployedCertStore && deployedCertStore.address
      );


      // deploy certificate  
      const deployedCert = Certificate.networks[networkId];
      const certInstance = new web3.eth.Contract(
        Certificate.abi,
        deployedCert && deployedCert.address
      );

      console.log("######### deployedCertNetwork", deployedCertNetwork);
      console.log("######### certNetworkInstance", certNetworkInstance);

      console.log("######### deployedCertStore", deployedCertStore);
      console.log("######### certStoreInstance", certStoreInstance);

      console.log("######### deployedCert", deployedCert);
      console.log("######### certInstance", certInstance);

      setWeb3(web3);
      setAccounts(accounts);
      setCertNetworkContract(certNetworkInstance);
      setCertStoreContract(certStoreInstance);
      setCertContract(certInstance);
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
          element={<Page pageType={"/student/viewCert"} certStoreContract={certStoreContract} certContract={certContract} />}
        />
        <Route
          path="/student/viewReq"
          element={<Page pageType={"/student/viewReq"} certStoreContract={certStoreContract} certContract={certContract} />}
        />
        <Route
          path="/student/viewVer"
          element={<Page pageType={"/student/viewVer"} certStoreContract={certStoreContract} certContract={certContract} accounts={accounts} />}
        />

        <Route
          path="/verifier/viewStudentCert"
          element={<Page pageType={"/verifier/viewStudentCert"} certStoreContract={certStoreContract} certContract={certContract} accounts={accounts}  />}
        />
        <Route
          path="/issuer/viewRequests"
          element={<Page pageType={"/issuer/viewRequests"} certStoreContract={certStoreContract} certContract={certContract} />}
        />
        <Route
          path="/issuer/viewIssued"
          element={<Page pageType={"/issuer/viewIssued"} certStoreContract={certStoreContract} certContract={certContract} />}
        />
        <Route
          path="/logout"
          element={<ReloadLogin />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;