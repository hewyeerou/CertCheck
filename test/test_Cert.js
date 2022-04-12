const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require('truffle-assertions');
var assert = require('assert');
const { isTypedArray } = require("util/types");
const { deepEqual } = require("assert");

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
        let I1 = await CertNetInstance.register(accounts[6], "Issuer", {from: accounts[6]});
        let I2 = await CertNetInstance.register(accounts[7], "Issuer", {from: accounts[7]});

        truffleAssert.eventEmitted(S1, 'Register');
        truffleAssert.eventEmitted(S2, 'Register');
        truffleAssert.eventEmitted(V1, 'Register');
        truffleAssert.eventEmitted(V2, 'Register');
        truffleAssert.eventEmitted(I1, 'Register');
        truffleAssert.eventEmitted(I2, 'Register');

    });

    it('issue: no request', async() => {
        
        truffleAssert.reverts( CertInstance.issueCertificate(accounts[2], "name", "nric", "no", "title", "date", {from: accounts[6]}),
        "Subject has not made any request.")
        
    });

    it('issue certificate', async() => {
        await CertStoreInstance.requestCert(accounts[6], {from: accounts[3]});
        cert = await CertInstance.issueCertificate(accounts[3], "name", "nric", "no", "title", "date", {from: accounts[6]});
        await truffleAssert.eventEmitted(cert, 'IssuedCertificate');
    });

    it('issue: no auth', async() => {
        await CertStoreInstance.requestCert(accounts[6], {from: accounts[2]});
        await CertStoreInstance.rejectRequest(accounts[2], {from: accounts[6]});
        await truffleAssert.reverts( CertInstance.issueCertificate(
            accounts[2],
            "name", "nric", "no", "title", "date",
            {from: accounts[6]}),)
    });


    it('Check Cert exist', async() => {
        var val = await CertInstance.checkCertExist(1);
        assert.deepEqual(
            val,
            true
        );
    })

    it('Check Cert does not exist', async() => {
        await truffleAssert.reverts(
            CertInstance.checkCertExist(100),
            "The certificate not valid.");
    })

    it('get Cert using ID', async() => {
        let certs = await CertInstance.getCertListById({from: accounts[3]});
        assert.equal(
            certs.length,
            1
        )
    });

    it('unapproved verifier gets cert', async ()=> {
        await truffleAssert.reverts(
        CertInstance.getCertListVerifiers(accounts[3], {from: accounts[4]}),
        )
    });

    it('approved verifier gets cert', async() => {
        await CertStoreInstance.grantVerifier(accounts[4], {from: accounts[3]});
        let list = await CertInstance.getCertListVerifiers(accounts[3], {from: accounts[4]});
        assert.equal(
            list.length,
            1
        )
    });

    it('revoke Cert from another issuer', async() => {
        await truffleAssert.reverts(
            CertInstance.revokeCert(1, {from: accounts[7]})
        )
    });

    it('revoke Cert', async() => {
        let result = await CertInstance.revokeCert(1, {from: accounts[6]});
        truffleAssert.eventEmitted(
            result,
            'RevokeCertificate'
        )
    });

    it('get certs revoked list', async() => {
        let list = await CertInstance.getCertsRevokedList({from: accounts[3]});
        assert.deepEqual(
            list.length,
            1
        )
    });

    
})