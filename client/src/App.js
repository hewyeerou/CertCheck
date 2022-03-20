import React, { useState, useEffect } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
// import SimpleStorageContract from "./contracts/SimpleStorage.json";
// import getWeb3 from "./getWeb3";
 import { addUser, getUserByAddress, updateUser, deleteUser } from "./models/User";

import "./App.css";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";

function App() {
    // initialize the state variables of the application
    const [storageValue, setStorageValue] = useState(0);
    const [web3, setWeb3] = useState();
    const [accounts, setAccounts] = useState();
    const [contract, setContract] = useState();
    // useEffect(() => {

    //   addUser('asdasd', 'asd', 'asd', 'asd', 'student', '');
    
    // })

    // useEffect(() => {
    //   const init = async () => {
    //       try {
    //           // Get network provider (typically MetaMask) and web3 instance
    //           const web3 = await getWeb3();

    //           // Use web3 to get the user's accounts from the provider (MetaMask)
    //           const accounts = await web3.eth.getAccounts();

    //           // Get the contract instance
    //           const networkId = await web3.eth.net.getId();
    //           const deployedNetwork = SimpleStorageContract.networks[networkId];
    //           const instance = new web3.eth.Contract(
    //               SimpleStorageContract.abi,
    //               deployedNetwork && deployedNetwork.address,
    //           );
    //           // Set web3, accounts, contract to the state
    //           setWeb3(web3);
    //           setContract(instance);
    //           setAccounts(accounts);
    //       } catch (error) {
    //           // Catch any errors for any of the above operations
    //           alert(
    //               `Failed to load web3, accounts, or contract. Did you migrate the contract or install MetaMask? Check console for details.`,
    //           );
    //           console.error(error);
    //       }
    //   };
    //   init();
    //  }, []);

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

    // if (typeof(web3) === 'undefined') {
    //     return <div className="App">Loading Web3, accounts, and contract... Reload page</div>;
    // }

    // equivalent to the render function of older React frameworks
    return (
        <Router>
          <Routes>
            <Route path='/' element={<Login/>} /> 
            <Route path="/register" element={<Register/>}/>
          </Routes>
        </Router>
        /* <h1>Good to Go!</h1>
        <p>Your Truffle Box is installed and ready.</p>
        <h2>Smart Contract Example</h2>
        <p>
          If your contracts compiled and migrated successfully, below will show
          a stored value of 5 (by default).
        </p>
        <p>
          Try changing the value stored on <strong>line 52</strong> of App.js.
        </p>
        <div>The stored value is: {storageValue}</div> */
    );

}

export default App;