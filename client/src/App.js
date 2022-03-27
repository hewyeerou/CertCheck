import React, { useState, useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { message } from 'antd';
import getWeb3 from './getWeb3';

import './App.css';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Page from './components/Page';

import CertificateNetwork from './contracts/CertificateNetwork.json';

function App() {
    // initialize the state variables of the application
    const [storageValue, setStorageValue] = useState(0);
    const [web3, setWeb3] = useState();
    const [accounts, setAccounts] = useState();
    const [certNetworkContract, setCertNetworkContract] = useState();
    const [deployedCertNetwork, setDeployedCertNetwork] = useState();

    const loadWeb3 = async () => {
        try {
            const web3 = await getWeb3();
            console.log('********** web3: ', web3);

            const accounts = await web3.eth.getAccounts();
            console.log('********** accounts: ', accounts);

            const networkId = await web3.eth.net.getId();
            const deployedCertNetwork = CertificateNetwork.networks[networkId];
            const certNetworkInstance = new web3.eth.Contract(
                CertificateNetwork.abi,
                deployedCertNetwork && deployedCertNetwork.address
            );

            console.log('######### deployedCertNetwork', deployedCertNetwork);
            console.log('######### certNetworkInstance', certNetworkInstance);

            setWeb3(web3);
            setAccounts(accounts);
            setCertNetworkContract(certNetworkInstance);
            setDeployedCertNetwork(deployedCertNetwork);
        } catch (error) {
            message.error(`Failed to load web3.`);
            console.error(error);
        }
    };

    useEffect(() => {
        loadWeb3();
    }, []);

    // // is called whenever there was any change in the state variables web3, accounts, contract
    // useEffect(() => {
    //   const runExample = async () => {
    //       // example of interaction with the smart contract
    //       try{
    //           // Stores a given value, 5 by default
    //           await contract.methods.set(5).send({ from: accounts[0] });

    //           // Get the value from the contract to prove it worked
    //           const response = await contract.methods.get().call();

    //           // Update state with the result
    //           setStorageValue (response);
    //       }
    //       catch (error){
    //           alert('No contract deployed or account error; please check that MetaMask is on the correct network, reset the account and reload page');
    //           console.error(error);
    //       }
    //   }
    //   if(typeof(web3) != 'undefined'
    //       && typeof(accounts) != 'undefined'
    //       && typeof(contract) != 'undefined'){
    //       runExample();
    //   }
    // }, [web3, accounts, contract]);

    if (typeof web3 === 'undefined') {
        return <div className='App'>Loading Web3, accounts, and contract... Reload page</div>;
    }

    // equivalent to the render function of older React frameworks
    return (
        <Router>
            <Routes>
                <Route path='/' element={<Login web3={web3} accounts={accounts} />} />
                <Route
                    path='/register'
                    element={<Register web3={web3} accounts={accounts} certNetworkContract={certNetworkContract} />}
                />
                <Route path='/viewCert' element={<Page pageType={'viewCert'} />} />
                <Route path='/viewReq' element={<Page pageType={'viewReq'} />} />
                <Route path='/viewVer' element={<Page pageType={'viewVer'} />} />
            </Routes>
        </Router>
    );
}

export default App;
