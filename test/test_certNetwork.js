const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require('truffle-assertions');
var assert = require('assert');
const { isTypedArray } = require("util/types");

var CertificateNetwork = artifacts.require("../contracts/CertificateNetwork.sol");

// Stakeholders Terminology
// S - Subjects
// V - Verifiers
// I - Issuers
// U - Address not registered on the network

contract('CertificateNetwork', function(accounts) {
    before(async() => {
        CertNetInstance = await CertificateNetwork.deployed();
    });
    console.log("Testing CertificateNetwork");

    it('Only register valid roles', async() => {
        await truffleAssert.reverts(
            CertNetInstance.register(accounts[2], "Employee", { from: accounts[2] }),
            "Role does not exist"
        );
    })

    it('Register all valid roles', async() => {
        let S1 = await CertNetInstance.register(accounts[2], "Subject", { from: accounts[2] });
        let V1 = await CertNetInstance.register(accounts[4], "Verifier", { from: accounts[4] });
        let I1 = await CertNetInstance.register(accounts[6], "Issuer", { from: accounts[6] });

        truffleAssert.eventEmitted(S1, 'Register');
        truffleAssert.eventEmitted(V1, 'Register');
        truffleAssert.eventEmitted(I1, 'Register');
    })

    it('Check users created', async() => {
        let subjectCheck = await CertNetInstance.checkUserExist(accounts[2], "Subject", { from: accounts[2] });
        let verifierCheck = await CertNetInstance.checkUserExist(accounts[4], "Verifier", { from: accounts[4] });
        let issuerCheck = await CertNetInstance.checkUserExist(accounts[6], "Issuer", { from: accounts[6] });

        assert.equal(
            subjectCheck,
            true,
            "Failed to create Subject"
        );
        assert.equal(
            verifierCheck,
            true,
            "Failed to create Verifier"
        );
        assert.equal(
            issuerCheck,
            true,
            "Failed to create Issuer"
        );
    });
    it('Check roles created', async() => {
        let subjectCheck = await CertNetInstance.getUserRole(accounts[2], { from: accounts[2] });
        let verifierCheck = await CertNetInstance.getUserRole(accounts[4], { from: accounts[4] });
        let issuerCheck = await CertNetInstance.getUserRole(accounts[6], { from: accounts[6] });

        assert.equal(
            subjectCheck,
            "Subject",
            "Failed to create Subject"
        );
        assert.equal(
            verifierCheck,
            "Verifier",
            "Failed to create Verifier"
        );
        assert.equal(
            issuerCheck,
            "Issuer",
            "Failed to create Issuer"
        );
    });
});