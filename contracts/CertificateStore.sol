pragma solidity >=0.5.0;
pragma experimental ABIEncoderV2;

import "./CertificateNetwork.sol";

contract CertificateStore {
    CertificateNetwork certNetwork;

    // S>I: Student can make many request
    // I>S: Issuer can receive many request
    mapping(address => address[]) private reqHistMap; // History of Unique Requests

    // Request map for S <=> I.T > Issue Pass F > Wont issue
    mapping(address => mapping(address => bool)) private requestMap;

    // Check if S request to I before (S>I)
    mapping(address => mapping(address => bool)) private requestExistMap;

    // S>V: Student can grant multiple Verifier to view their cert.
    // V>S: Verifier can view multiple subject Cert
    mapping(address => address[]) private grantHistMap; // History of Unique Grants

    // Grant map for S <=> V.
    mapping(address => mapping(address => bool)) private grantMap;

    // Check if S has granted V before (S>V)
    mapping(address => mapping(address => bool)) private grantExistMap;

    // REMOVED mappings:
    // Replaced with certHistMap
    // mapping(address => uint256[]) private subjectToCertListMap; // map subject to issued certs(by certId) by issuers
    // mapping(address => uint256[]) private issuerToCertListMap; // map issuer to issued certs(by certId)

    // Replaced with addrToCertMap
    // mapping(address => mapping(uint256 => bool)) private subjectToCertMap;
    // mapping(address => mapping(uint256 => bool)) private issuerToCertMap;
    // mapping(address => mapping(address => bool)) private requestMap;

    // Replaced with grantMap
    // mapping(address => mapping(address => bool)) private subjectToVerifierMap; // S>(V>bool), map subject to all approved verifiers to view all certs

    // Events
    event IssuedCertificate(
        uint256 certId,
        address issuerAddr,
        address subjectAddr
    );
    event RevokeCertificate(address issuer, uint256 certId);
    event RequestCertificate(address subjectAddr, address issuerAddr);
    event AcceptSubjectRequest(address issuerAddr, address subjectAddr);
    event RejectSubjectRequest(address issuerAddr, address subjectAddr);

    event VerifierGranted(address subjectAddr, address verifierAddr);
    event VerifierDenied(address subjectAddr, address verifierAddr);

    //event ViewVerifierStatus(address subjectAddr, bool status);
    //event ViewSubjectStatus(address verifierAddr, bool status);

    constructor(CertificateNetwork cn) public {
        certNetwork = cn;
    }

    // Modifiers
    modifier onlyValidRoles(string memory role) {
        require(
            certNetwork.checkUserExist(msg.sender, role),
            "This action can only be performed by authorized roles."
        );
        _;
    }

    // Used to check if a user exist, i.e. issue cert to subject, check if that subject exist in our system.
    modifier userExist(address addr, string memory role) {
        require(
            certNetwork.checkUserExist(addr, role),
            "The action can only be performed on valid users."
        );
        _;
    }
    modifier onlyIssuerSubject() {
        require(
            certNetwork.checkUserExist(msg.sender, "Subject") ||
                certNetwork.checkUserExist(msg.sender, "Issuer"),
            "This action can only be performed by authorized roles."
        );
        _;
    }

    //test later
    modifier onlyVerifierSubject() {
        require(
            certNetwork.checkUserExist(msg.sender, "Subject") ||
                certNetwork.checkUserExist(msg.sender, "Verifier"),
            "This action can only be performed by authorized roles."
        );
        _;
    }

    // Request cert from issuer. (SUBJECT -> ISSUER)
    // Issue: subject can spam request for each issuer without being a subject
    // Assumptions:
    // 1. Subject know school block addr
    // 2. Subject belongs to the school and is legitamite.
    // 3. Subject only needs to request from the sch once for a sch to send all the subjects cert.
    function requestCert(address issuerAddr)
        public
        onlyValidRoles("Subject")
        userExist(issuerAddr, "Issuer")
    {
        require(
            !requestMap[msg.sender][issuerAddr],
            "You have already requested for a cert."
        );

        requestMap[msg.sender][issuerAddr] = true; // subject request
        requestMap[issuerAddr][msg.sender] = true; // issuer to approve

        // add only new unique request
        if (!requestExistMap[msg.sender][issuerAddr]) {
            reqHistMap[msg.sender].push(issuerAddr);
            reqHistMap[issuerAddr].push(msg.sender);
        }

        // Record user requested before
        requestExistMap[msg.sender][issuerAddr] = true;
        emit RequestCertificate(msg.sender, issuerAddr);
    }

    function rejectRequest(address subjectAddr)
        public
        onlyValidRoles("Issuer")
        userExist(subjectAddr, "Subject")
    {
        require(
            requestMap[subjectAddr][msg.sender],
            "Subject has not made any request."
        ); // S>I
        require(
            requestMap[msg.sender][subjectAddr],
            "The action has already been performed."
        ); // I>S

        requestMap[msg.sender][subjectAddr] = false;
        requestMap[subjectAddr][msg.sender] = false;
        emit RejectSubjectRequest(msg.sender, subjectAddr);
    }

    function getApprovedReqList()
        public
        view
        onlyIssuerSubject
        returns (address[] memory)
    {
        address[] memory reqHist = reqHistMap[msg.sender];
        address[] memory tempList = new address[](reqHist.length);
        uint256 y = 0;
        for (uint256 i = 0; i < reqHist.length; i++) {
            // check if issuer approve subject and student make req to issuer
            if (
                requestMap[msg.sender][reqHist[i]] &&
                requestMap[reqHist[i]][msg.sender]
            ) {
                // Get all valid request
                tempList[y] = reqHist[i];
                y++;
            }
        }
        address[] memory newList = new address[](y);
        for (uint256 i = 0; i < y; i++) {
            newList[i] = tempList[i];
        }
        return newList;
    }

    function getRejectedReqList()
        public
        view
        onlyIssuerSubject
        returns (address[] memory)
    {
        address[] memory reqHist = reqHistMap[msg.sender];
        address[] memory tempList = new address[](reqHist.length);
        uint256 y = 0;
        for (uint256 i = 0; i < reqHist.length; i++) {
            // check if issuer approve subject and student make req to issuer
            if (
                !requestMap[msg.sender][reqHist[i]] &&
                !requestMap[reqHist[i]][msg.sender]
            ) {
                // Get all valid request
                tempList[y] = reqHist[i];
                y++;
            }
        }
        address[] memory newList = new address[](y);
        for (uint256 i = 0; i < y; i++) {
            newList[i] = tempList[i];
        }
        return newList;
    }

    // Get all unique request history regardless of approve/deny
    function getReqHist()
        public
        view
        onlyIssuerSubject
        returns (address[] memory)
    {
        return reqHistMap[msg.sender];
    }

    function checkRequest(address addr)
        public
        view
        onlyIssuerSubject
        returns (bool)
    {
        require(
            keccak256(abi.encodePacked(certNetwork.getUserRole(addr))) ==
                keccak256(abi.encodePacked("Subject")) ||
                keccak256(abi.encodePacked(certNetwork.getUserRole(addr))) ==
                keccak256(abi.encodePacked("Issuer")),
            "User address with specified role does not exist."
        );
        require(
            !(msg.sender == addr),
            "Action cannot be performed on the same address."
        );
        if (requestMap[addr][msg.sender] && requestMap[msg.sender][addr]) {
            return true;
        }
        return false;
    }

    // for I>S, check user requested
    function getRequestStatus(address issuerAddr, address subjectAddr)
        public
        view
        userExist(issuerAddr, "Issuer")
        userExist(subjectAddr, "Subject")
        returns (bool)
    {
        return requestMap[subjectAddr][issuerAddr];
    }

    // for I>S, check if issuer have deny before
    function getIssueStatus(address issuerAddr, address subjectAddr)
        public
        view
        userExist(issuerAddr, "Issuer")
        userExist(subjectAddr, "Subject")
        returns (bool)
    {
        return requestMap[issuerAddr][subjectAddr];
    }

    //Xie Ran's tests covering the following methods
    //Between Subjects and Verifiers

    // for V>S, check grant list
    function getAccessStatus(address verifierAddr, address subjectAddr)
        public
        view
        userExist(verifierAddr, "Verifier")
        userExist(subjectAddr, "Subject")
        returns (bool)
    {
        return grantMap[subjectAddr][verifierAddr];
    }

    // Grant access to a verifier to viewing all subject certs.(SUBJECT -> VERIFIER)
    function grantVerifier(address verifierAddr)
        public
        onlyValidRoles("Subject")
        userExist(verifierAddr, "Verifier")
    {
        require(
            !grantMap[msg.sender][verifierAddr],
            "Verifier has already been given access."
        );

        // record grant: S<=>V
        grantMap[msg.sender][verifierAddr] = true;
        grantMap[verifierAddr][msg.sender] = true;

        // record uniqiue grant history
        if (!grantExistMap[msg.sender][verifierAddr]) {
            grantHistMap[msg.sender].push(verifierAddr);
            grantHistMap[verifierAddr].push(msg.sender);
        }
        grantExistMap[msg.sender][verifierAddr] = true;
        emit VerifierGranted(msg.sender, verifierAddr);
    }

    // Deny access to a verifier to viewing all subject certs.(SUBJECT -> VERIFIER)
    function denyVerifier(address verifierAddr)
        public
        onlyValidRoles("Subject")
        userExist(verifierAddr, "Verifier")
    {
        require(
            grantMap[msg.sender][verifierAddr],
            "Verifier already has no access."
        );

        grantMap[verifierAddr][msg.sender] = false; // remove access for verifier
        grantMap[msg.sender][verifierAddr] = false; // remove access given by S>V

        emit VerifierDenied(msg.sender, verifierAddr);
    }

    // S>V: Subject can view the status of a verifier
    // V>S: Verifier can view the status of a subject
    function checkGrantStatus(address add)
        public
        view
        onlyVerifierSubject
        returns (bool)
    {
        if (grantMap[msg.sender][add] && grantMap[add][msg.sender]) {
            return true;
        }
        return false;
    }

    // S>V: Subject can view verifier they given access to.
    // V>S: Verifier can view subject they given access from.
    // this list updates automatically
    function getGrantList()
        public
        view
        onlyVerifierSubject
        returns (address[] memory)
    {
        address[] memory grantList = grantHistMap[msg.sender];
        address[] memory tempList = new address[](grantList.length);
        uint256 y = 0;
        for (uint256 i = 0; i < grantList.length; i++) {
            if (
                grantMap[msg.sender][grantList[i]] &&
                grantMap[grantList[i]][msg.sender]
            ) {
                tempList[y] = grantList[i];
                y++;
            }
        }
        address[] memory newList = new address[](y);
        for (uint256 i = 0; i < y; i++) {
            newList[i] = tempList[i];
        }
        return newList;
    }

    // S>V: Subject can view verifier they have denied access to.
    // V>S: Verifier can view subject they have been denied access to.
    // this list updates automatically
    function getDenyList()
        public
        view
        onlyVerifierSubject
        returns (address[] memory)
    {
        address[] memory grantList = grantHistMap[msg.sender];
        address[] memory tempList = new address[](grantList.length);
        uint256 y = 0;
        for (uint256 i = 0; i < grantList.length; i++) {
            if (
                !(grantMap[msg.sender][grantList[i]] &&
                    grantMap[grantList[i]][msg.sender])
            ) {
                tempList[y] = grantList[i];
                y++;
            }
        }
        address[] memory newList = new address[](y);
        for (uint256 i = 0; i < y; i++) {
            newList[i] = tempList[i];
        }
        return newList;
    }
}
