const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require('truffle-assertions');
var assert = require('assert');
const { isTypedArray } = require("util/types");

var CertificateNetwork = artifacts.require("../contracts/CertificateNetwork.sol");
var CertificateStore = artifacts.require("../contracts/CertificateStore.sol");
var Certificate = artifacts.require("../contracts/Certificate.sol");

//follow accounts in readme
//Deploy CertNetwork.sol w admin account (acc1)
contract('CertificateStore', function(accounts) {
    
    before(async () => {
        CertNetInstance = await CertificateNetwork.deployed();
        CertStoreInstance = await CertificateStore.deployed();
    });
    console.log("Testing CertificateStore");

    //register users
    it('Register Users', async () => {
        
        let S1 = await CertNetInstance.register(accounts[2], "Subject", {from: accounts[2]});
        let S2 = await CertNetInstance.register(accounts[3], "Subject", {from: accounts[3]});
        let V1 = await CertNetInstance.register(accounts[4], "Verifier", {from: accounts[4]});
        let V2 = await CertNetInstance.register(accounts[5], "Verifier", {from: accounts[5]});

        truffleAssert.eventEmitted(S1, 'Register');
        truffleAssert.eventEmitted(S2, 'Register');
        truffleAssert.eventEmitted(V1, 'Register');
        truffleAssert.eventEmitted(V2, 'Register');

    })

    //Test that the sub1 can grant ver1
    it('Subject can grant access', async () => {
        let grant0 = await CertStoreInstance.grantVerifier(accounts[4], {from: accounts[2]});
        let grant1 = await CertStoreInstance.grantVerifier(accounts[5], {from: accounts[2]});
        let grant2 = await CertStoreInstance.grantVerifier(accounts[4], {from: accounts[3]});

        truffleAssert.eventEmitted(grant0, 'VerifierGranted');
        truffleAssert.eventEmitted(grant1, 'VerifierGranted');
        truffleAssert.eventEmitted(grant2, 'VerifierGranted');

    });


    it('Subject can check the status of the verifier', async () => {
        let check1 = await CertStoreInstance.checkGrantStatus(accounts[4], {from: accounts[2]});
        let check2 = await CertStoreInstance.checkGrantStatus(accounts[4], {from: accounts[3]});

        
        assert.equal(
            check1,
            true,
            "Failed to view status"
        );

        assert.equal(
            check2,
            true,
            "Failed to view status"
        );
    });

    it('Verifier can check the status of the subject', async () => {
        let check3 = await CertStoreInstance.checkGrantStatus(accounts[2], {from: accounts[4]});
        let check4 = await CertStoreInstance.checkGrantStatus(accounts[2], {from: accounts[5]});

        assert.equal(
            check3,
            true,
            "Failed to view status"
        );

        assert.equal(
            check4,
            true,
            "Failed to view status"
        );
    });

    //Test that the sub1 can deny ver1
    it('Subject can deny access', async () => {
        let deny1 = await CertStoreInstance.denyVerifier(accounts[4], {from: accounts[2]});
        let deny2 = await CertStoreInstance.denyVerifier(accounts[5], {from: accounts[2]});

        truffleAssert.eventEmitted(deny1, 'VerifierDenied');
        truffleAssert.eventEmitted(deny2, 'VerifierDenied');
    });

    it('Subject can view the list of denied verifiers', async () => {
        let l5 = await CertStoreInstance.getDenyList( {from: accounts[2]});
        var l6 = [accounts[4], accounts[5]];

        assert.deepEqual(
            l5,
            l6,
            "Failed to view list"
        );
    });

    it('Verifier can view the list of subjects denied by', async () => {
        let l7 = await CertStoreInstance.getDenyList( {from: accounts[4]});
        var l8 = [accounts[2]];

        assert.deepEqual(
            l7,
            l8,
            "Failed to view list"
        );
    });

    it('Verifier can view list of subjects granted by', async () => {
        let grant3 = await CertStoreInstance.grantVerifier(accounts[4], {from: accounts[2]});
        let grant4 = await CertStoreInstance.grantVerifier(accounts[5], {from: accounts[2]});

        //s1 grants v1 again
        let l3 = await CertStoreInstance.getGrantList( {from: accounts[4]});
        var l4 = [accounts[2], accounts[3]];

        assert.deepEqual(
            l3,
            l4,
            "Failed to view list"
        );
    });

    it('Subject can view list of verifiers granted', async () => {
        let l1 = await CertStoreInstance.getGrantList( {from: accounts[2]});
        var l2 = [accounts[4], accounts[5]];

        assert.deepEqual(
            l1,
            l2,
            "Failed to view list"
        );
    });

    it('The DenyList updates after granting again', async () => {
        let l5 = await CertStoreInstance.getDenyList( {from: accounts[2]});

        assert.deepEqual(
            l5,
            [],
            "Failed to update."
        );
    });


    it('Verifier cannot grant himself', async () => {
        await truffleAssert.reverts(
            CertStoreInstance.grantVerifier(accounts[4], {from: accounts[4]}), 
            "This action can only be performed by authorized roles."
        );
    });

    it('Verifier cannot deny subjects', async () => {
        await truffleAssert.reverts(
            CertStoreInstance.denyVerifier(accounts[2], {from: accounts[4]}), 
            "This action can only be performed by authorized roles."
        );
    });

    it('Subject cannot grant a verifier twice', async () => {
        await truffleAssert.reverts(
            CertStoreInstance.grantVerifier(accounts[4], {from: accounts[2]}), 
            "Verifier has already been given access."
        );
    });

    it('Subject cannot deny a subject', async () => {
        await truffleAssert.reverts(
            CertStoreInstance.denyVerifier(accounts[3], {from: accounts[2]}), 
            "The action can only be performed on valid users."
        );
    });

    it('Subject cannot deny a verifier with no access', async () => {
        let deny2 = await CertStoreInstance.denyVerifier(accounts[5], {from: accounts[2]});
        await truffleAssert.reverts(
            CertStoreInstance.denyVerifier(accounts[5], {from: accounts[2]}), 
            "Verifier already has no access."
        );
    });

    it('Subject cannot grant random address', async () => {
        await truffleAssert.reverts(
            CertStoreInstance.denyVerifier(accounts[6], {from: accounts[2]}), 
            "User not registered in system."
        );
    });

})