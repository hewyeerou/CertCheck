const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require('truffle-assertions');
var assert = require('assert');
const { isTypedArray } = require("util/types");

var CertificateNetwork = artifacts.require("../contracts/CertificateNetwork.sol");
var CertificateStore = artifacts.require("../contracts/CertificateStore.sol");

// Stakeholders Terminology
// S - Subjects
// V - Verifiers
// I - Issuers
// U - Address not registered on the network

contract('CertificateStore', function(accounts) {

    before(async() => {
        CertNetInstance = await CertificateNetwork.deployed();
        CertStoreInstance = await CertificateStore.deployed();
    });
    console.log("Testing CertificateStore");

    //register users
    it('Register Users', async() => {

        let S1 = await CertNetInstance.register(accounts[2], "Subject", { from: accounts[2] });
        let S2 = await CertNetInstance.register(accounts[3], "Subject", { from: accounts[3] });
        let V1 = await CertNetInstance.register(accounts[4], "Verifier", { from: accounts[4] });
        let V2 = await CertNetInstance.register(accounts[5], "Verifier", { from: accounts[5] });
        let I1 = await CertNetInstance.register(accounts[6], "Issuer", { from: accounts[6] });
        let I2 = await CertNetInstance.register(accounts[7], "Issuer", { from: accounts[7] });

        truffleAssert.eventEmitted(S1, 'Register');
        truffleAssert.eventEmitted(S2, 'Register');
        truffleAssert.eventEmitted(V1, 'Register');
        truffleAssert.eventEmitted(V2, 'Register');
        truffleAssert.eventEmitted(I1, 'Register');
        truffleAssert.eventEmitted(I2, 'Register');
    })


    it('Only subjects can make request to valid issuers', async() => {
        // V>I
        await truffleAssert.reverts(
            CertStoreInstance.requestCert(accounts[6], { from: accounts[4] }),
            "This action can only be performed by authorized roles."
        );

        // I>I
        await truffleAssert.reverts(
            CertStoreInstance.requestCert(accounts[6], { from: accounts[7] }),
            "This action can only be performed by authorized roles."
        );

        // U>I
        await truffleAssert.reverts(
            CertStoreInstance.requestCert(accounts[6], { from: accounts[8] }),
            "User not registered in system."
        );
    });

    it('Subject cannot make request to invalid address', async() => {
        // S>V
        await truffleAssert.reverts(
            CertStoreInstance.requestCert(accounts[4], { from: accounts[2] }),
            "The action can only be performed on valid users."
        );
        // S>S
        await truffleAssert.reverts(
            CertStoreInstance.requestCert(accounts[3], { from: accounts[2] }),
            "The action can only be performed on valid users."
        );
        // S>U
        await truffleAssert.reverts(
            CertStoreInstance.requestCert(accounts[8], { from: accounts[2] }),
            "User not registered in system."
        );
    });

    it('Subject can request for certificate', async() => {
        let req1 = await CertStoreInstance.requestCert(accounts[6], { from: accounts[2] });
        let req2 = await CertStoreInstance.requestCert(accounts[7], { from: accounts[2] });
        truffleAssert.eventEmitted(req1, 'RequestCertificate');
        truffleAssert.eventEmitted(req2, 'RequestCertificate');
    });

    it("Double Request sent", async() => {
        await truffleAssert.reverts(
            CertStoreInstance.requestCert(accounts[6], { from: accounts[2] }),
            "You have already requested for a cert."
        );
    });

    it('Only subjects and issuers can check request', async() => {
        // V>I
        await truffleAssert.reverts(
            CertStoreInstance.checkRequest(accounts[6], { from: accounts[4] }),
            "This action can only be performed by authorized roles."
        );

        // V>S
        await truffleAssert.reverts(
            CertStoreInstance.checkRequest(accounts[2], { from: accounts[4] }),
            "This action can only be performed by authorized roles."
        );

        // U>S/I
        await truffleAssert.reverts(
            CertStoreInstance.checkRequest(accounts[2], { from: accounts[8] }),
            "User not registered in system."
        );
    });

    it('Issuer and subject can check the status of the request', async() => {
        let subjectCheck = await CertStoreInstance.checkRequest(accounts[6], { from: accounts[2] });
        let issuerCheck = await CertStoreInstance.checkRequest(accounts[2], { from: accounts[6] });

        assert.equal(
            subjectCheck,
            true,
            "Failed to view status"
        );
        assert.equal(
            issuerCheck,
            true,
            "Failed to view status"
        );
    });

    it('Subject can view all requests made to issuers', async() => {
        let arr1 = await CertStoreInstance.getApprovedReqList({ from: accounts[2] });

        assert.deepEqual(
            arr1, [accounts[6], accounts[7]],
            "Failed to view list"
        );
    });

    it('Issuer can view all requests received from subjects', async() => {
        let arr2 = await CertStoreInstance.getApprovedReqList({ from: accounts[6] });
        let arr3 = await CertStoreInstance.getApprovedReqList({ from: accounts[7] });
        var arr4 = [accounts[2]];

        assert.deepEqual(
            arr2, arr4,
            "Failed to view list"
        );
        assert.deepEqual(
            arr3, arr4,
            "Failed to view list"
        );
    });

    it('Only issuers can reject request from subjects', async() => {
        // V>S
        await truffleAssert.reverts(
            CertStoreInstance.rejectRequest(accounts[2], { from: accounts[4] }),
            "This action can only be performed by authorized roles."
        );

        // S>S
        await truffleAssert.reverts(
            CertStoreInstance.rejectRequest(accounts[2], { from: accounts[3] }),
            "This action can only be performed by authorized roles."
        );

        // U>S
        await truffleAssert.reverts(
            CertStoreInstance.rejectRequest(accounts[2], { from: accounts[8] }),
            "User not registered in system."
        );
    });

    it('Only reject request that subject made to issuer', async() => {
        await truffleAssert.reverts(
            CertStoreInstance.rejectRequest(accounts[3], { from: accounts[6] }),
            "Subject has not made any request."
        );
    });

    it('Issuer can deny request', async() => {
        let deny1 = await CertStoreInstance.rejectRequest(accounts[2], { from: accounts[6] });
        truffleAssert.eventEmitted(deny1, 'RejectSubjectRequest');
    });

    it('Only authorised roles can view rejected list.', async() => {
        // V>S or V>I
        await truffleAssert.reverts(
            CertStoreInstance.getRejectedReqList({ from: accounts[4] }),
            "This action can only be performed by authorized roles."
        );

        await truffleAssert.reverts(
            CertStoreInstance.getRejectedReqList({ from: accounts[4] }),
            "This action can only be performed by authorized roles."
        );

        //U>S or I
        await truffleAssert.reverts(
            CertStoreInstance.getRejectedReqList({ from: accounts[8] }),
            "User not registered in system."
        );
    });

    it('Subject can view the list of rejected request.', async() => {
        let arr5 = await CertStoreInstance.getRejectedReqList({ from: accounts[2] });

        assert.deepEqual(
            arr5, [accounts[6]],
            "Failed to view list"
        );
    });

    it('Issuer can view the list of rejected request.', async() => {
        let arr6 = await CertStoreInstance.getRejectedReqList({ from: accounts[6] });
        let arr7 = await CertStoreInstance.getRejectedReqList({ from: accounts[7] });

        assert.deepEqual(
            arr6, [accounts[2]],
            "Failed to view list"
        );
        assert.deepEqual(
            arr7, [],
            "Failed to view list"
        );
    });

    it('Rejected request list updates after subject make another request again', async() => {
        let req3 = await CertStoreInstance.requestCert(accounts[6], { from: accounts[2] });
        truffleAssert.eventEmitted(req3, 'RequestCertificate');

        let arr8 = await CertStoreInstance.getApprovedReqList({ from: accounts[2] });
        let arr9 = await CertStoreInstance.getApprovedReqList({ from: accounts[6] });
        let arr10 = await CertStoreInstance.getRejectedReqList({ from: accounts[2] });
        let arr11 = await CertStoreInstance.getRejectedReqList({ from: accounts[6] });

        assert.deepEqual(
            arr8, [accounts[6], accounts[7]],
            "Failed to update."
        );
        assert.deepEqual(
            arr9, [accounts[2]],
            "Failed to update."
        );
        assert.deepEqual(
            arr10, [],
            "Failed to update."
        );
        assert.deepEqual(
            arr11, [],
            "Failed to update."
        );
    });

    it('Check request history record all unique request made.', async() => {
        let arr12 = await CertStoreInstance.getReqHist({ from: accounts[2] });
        let arr13 = await CertStoreInstance.getReqHist({ from: accounts[3] });
        let arr14 = await CertStoreInstance.getReqHist({ from: accounts[6] });
        let arr15 = await CertStoreInstance.getReqHist({ from: accounts[7] });

        assert.deepEqual(
            arr12, [accounts[6], accounts[7]],
            "Invalid history records"
        );
        assert.deepEqual(
            arr13, [],
            "Invalid history records"
        );
        assert.deepEqual(
            arr14, [accounts[2]],
            "Invalid history records"
        );
        assert.deepEqual(
            arr15, [accounts[2]],
            "Invalid history records"
        );
    });

    it('Only subjects can grant access to valid verifiers', async() => {
        // V>V
        await truffleAssert.reverts(
            CertStoreInstance.grantVerifier(accounts[4], { from: accounts[4] }),
            "This action can only be performed by authorized roles."
        );

        // I>V
        await truffleAssert.reverts(
            CertStoreInstance.grantVerifier(accounts[4], { from: accounts[6] }),
            "This action can only be performed by authorized roles."
        );

        // U>V
        await truffleAssert.reverts(
            CertStoreInstance.grantVerifier(accounts[4], { from: accounts[8] }),
            "User not registered in system."
        );
    });

    it('Subjects cannot give grants to invalid address', async() => {
        // S>I
        await truffleAssert.reverts(
            CertStoreInstance.grantVerifier(accounts[6], { from: accounts[2] }),
            "The action can only be performed on valid users."
        );
        // S>S
        await truffleAssert.reverts(
            CertStoreInstance.grantVerifier(accounts[3], { from: accounts[2] }),
            "The action can only be performed on valid users."
        );
        // S>U
        await truffleAssert.reverts(
            CertStoreInstance.grantVerifier(accounts[8], { from: accounts[2] }),
            "User not registered in system."
        );
    });

    it('Subjects can grant access', async() => {
        let grant0 = await CertStoreInstance.grantVerifier(accounts[4], { from: accounts[2] });
        let grant1 = await CertStoreInstance.grantVerifier(accounts[5], { from: accounts[2] });
        let grant2 = await CertStoreInstance.grantVerifier(accounts[4], { from: accounts[3] });

        truffleAssert.eventEmitted(grant0, 'VerifierGranted');
        truffleAssert.eventEmitted(grant1, 'VerifierGranted');
        truffleAssert.eventEmitted(grant2, 'VerifierGranted');
    });

    it('Double grant verifier', async() => {
        await truffleAssert.reverts(
            CertStoreInstance.grantVerifier(accounts[4], { from: accounts[2] }),
            "Verifier has already been given access."
        );
    });

    it('Only subjects and verifiers can check request', async() => {
        // I>S
        await truffleAssert.reverts(
            CertStoreInstance.checkGrantStatus(accounts[4], { from: accounts[6] }),
            "This action can only be performed by authorized roles."
        );

        // I>S
        await truffleAssert.reverts(
            CertStoreInstance.checkGrantStatus(accounts[2], { from: accounts[6] }),
            "This action can only be performed by authorized roles."
        );

        // U>S/V
        await truffleAssert.reverts(
            CertStoreInstance.checkGrantStatus(accounts[2], { from: accounts[8] }),
            "User not registered in system."
        );
    });

    it('Subjects can check the status of the verifier', async() => {
        let check1 = await CertStoreInstance.checkGrantStatus(accounts[4], { from: accounts[2] });
        let check2 = await CertStoreInstance.checkGrantStatus(accounts[5], { from: accounts[2] });
        let check3 = await CertStoreInstance.checkGrantStatus(accounts[4], { from: accounts[3] });

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
        assert.equal(
            check3,
            true,
            "Failed to view status"
        );
    });

    it('Verifier can check the status of the subject', async() => {
        let check4 = await CertStoreInstance.checkGrantStatus(accounts[2], { from: accounts[4] });
        let check5 = await CertStoreInstance.checkGrantStatus(accounts[3], { from: accounts[4] });
        let check6 = await CertStoreInstance.checkGrantStatus(accounts[2], { from: accounts[5] });

        assert.equal(
            check4,
            true,
            "Failed to view status"
        );

        assert.equal(
            check5,
            true,
            "Failed to view status"
        );

        assert.equal(
            check6,
            true,
            "Failed to view status"
        );
    });

    it('Only subjects can deny access from verifiers', async() => {
        // V>V
        await truffleAssert.reverts(
            CertStoreInstance.denyVerifier(accounts[4], { from: accounts[4] }),
            "This action can only be performed by authorized roles."
        );

        // I>V
        await truffleAssert.reverts(
            CertStoreInstance.denyVerifier(accounts[4], { from: accounts[6] }),
            "This action can only be performed by authorized roles."
        );

        // U>V
        await truffleAssert.reverts(
            CertStoreInstance.denyVerifier(accounts[4], { from: accounts[8] }),
            "User not registered in system."
        );
    });

    it('Subjects can deny access', async() => {
        let deny1 = await CertStoreInstance.denyVerifier(accounts[4], { from: accounts[2] });
        let deny2 = await CertStoreInstance.denyVerifier(accounts[4], { from: accounts[3] });

        truffleAssert.eventEmitted(deny1, 'VerifierDenied');
        truffleAssert.eventEmitted(deny2, 'VerifierDenied');
    });

    it('Double deny access', async() => {
        await truffleAssert.reverts(
            CertStoreInstance.denyVerifier(accounts[4], { from: accounts[2] }),
            "Verifier already has no access."
        );
    });

    it('Subjects can view the list of denied verifiers', async() => {
        let list1 = await CertStoreInstance.getDenyList({ from: accounts[2] });
        let list2 = await CertStoreInstance.getDenyList({ from: accounts[3] });

        assert.deepEqual(
            list1, [accounts[4]],
            "Failed to view list"
        );
        assert.deepEqual(
            list2, [accounts[4]],
            "Failed to view list"
        );
    });

    it('Verifier can view the list of denied access by subjects ', async() => {
        let list3 = await CertStoreInstance.getDenyList({ from: accounts[4] });
        let list4 = await CertStoreInstance.getDenyList({ from: accounts[5] });

        assert.deepEqual(
            list3, [accounts[2], accounts[3]],
            "Failed to view list"
        );
        assert.deepEqual(
            list4, [],
            "Failed to view list"
        );
    });

    it('Verifier can be given grant again by subject', async() => {
        let grant3 = await CertStoreInstance.grantVerifier(accounts[4], { from: accounts[2] });
        truffleAssert.eventEmitted(grant3, 'VerifierGranted');

        let list5 = await CertStoreInstance.getGrantList({ from: accounts[2] });
        let list6 = await CertStoreInstance.getGrantList({ from: accounts[4] });

        assert.deepEqual(
            list5, [accounts[4], accounts[5]], // acc5 prev added, acc4 newly added
            "Failed to view list"
        );
        assert.deepEqual(
            list6, [accounts[2]],
            "Failed to view list"
        );
    });

    it('The DenyList updates after granting again', async() => {
        let list7 = await CertStoreInstance.getDenyList({ from: accounts[2] });

        assert.deepEqual(
            list7, [],
            "Failed to update."
        );
    });

    it('Check grant history record all unique grants made.', async() => {
        let arr16 = await CertStoreInstance.getGrantHist({ from: accounts[2] });
        let arr17 = await CertStoreInstance.getGrantHist({ from: accounts[3] });
        let arr18 = await CertStoreInstance.getGrantHist({ from: accounts[4] });
        let arr19 = await CertStoreInstance.getGrantHist({ from: accounts[5] });

        assert.deepEqual(
            arr16, [accounts[4], accounts[5]],
            "Invalid history records"
        );
        assert.deepEqual(
            arr17, [accounts[4]],
            "Invalid history records"
        );
        assert.deepEqual(
            arr18, [accounts[2], accounts[3]],
            "Invalid history records"
        );
        assert.deepEqual(
            arr19, [accounts[2]],
            "Invalid history records"
        );
    });
});