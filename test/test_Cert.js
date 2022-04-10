const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require('truffle-assertions');
var assert = require('assert');
const { isTypedArray } = require("util/types");

var CertificateNetwork = artifacts.require("../contracts/CertificateNetwork.sol");
var CertificateStore = artifacts.require("../contracts/CertificateStore.sol");
var Certificate = artifacts.require("../contracts/Certificate.sol");


contract('Certificate', function(accounts) {
    
    before(async () => {
        CertNetInstance = await CertificateNetwork.deployed();
        CertStoreInstance = await CertificateStore.deployed();
        CertInstance = await Certificate.deployed();
    });
    console.log("Testing Certificate");


    //register users
    it('Register Users', async () => {
        
        let S1 = await CertNetInstance.register(accounts[2], "Subject", {from: accounts[2]});
        let S2 = await CertNetInstance.register(accounts[3], "Subject", {from: accounts[3]});
        let V1 = await CertNetInstance.register(accounts[4], "Verifier", {from: accounts[4]});
        let V2 = await CertNetInstance.register(accounts[5], "Verifier", {from: accounts[5]});
        let I1 = await CertNetInstance.register(accounts[6], "Issuer", {from: accounts[8]});
        let I2 = await CertNetInstance.register(accounts[7], "Issuer", {from: accounts[9]});

        truffleAssert.eventEmitted(S1, 'Register');
        truffleAssert.eventEmitted(S2, 'Register');
        truffleAssert.eventEmitted(V1, 'Register');
        truffleAssert.eventEmitted(V2, 'Register');
        truffleAssert.eventEmitted(I1, 'Register');
        truffleAssert.eventEmitted(I2, 'Register');

    })
})