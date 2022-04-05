pragma solidity >=0.5.0;
pragma experimental ABIEncoderV2;

import "./CertificateNetwork.sol";
import "./Certificate.sol";

contract CertificateStore {
    CertificateNetwork certNetwork;

    // S>I: Student can make many request
    // I>S: Issuer can receive many request
    mapping(address => address[]) private reqHistMap; // History of Request

    // Request map for S <=> I.
    mapping(address => mapping(address => bool)) private requestMap;

    // S>V: Student can grant multiple Verifier to view their cert.
    // V>S: Verifier can view multiple subject Cert
    mapping(address => address[]) private grantHistMap; // History of Grants

    // Grant map for S <=> V.
    mapping(address => mapping(address => bool)) private grantMap;

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
    event GiveAccessViewing(address subjectAddr, address verifierAddr);
    event DenyAccessViewing(address subjectAddr, address verifierAddr);
    event ViewSubjectCerts(address verifierAddr, address subjectAddr);
    event ViewVerifierStatus(address subjectAddr, bool status);
    event ViewSubjectStatus(address verifierAddr, bool status);

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
            "This action can only be performed by user in our network."
        );
        _;
    }
    modifier onlyIssuerSubject() {
        require(
            keccak256(abi.encodePacked(certNetwork.getUserRole(msg.sender))) ==
                keccak256(abi.encodePacked("Subject")) ||
                keccak256(
                    abi.encodePacked(certNetwork.getUserRole(msg.sender))
                ) ==
                keccak256(abi.encodePacked("Issuer")),
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

        reqHistMap[msg.sender].push(issuerAddr);
        reqHistMap[issuerAddr].push(msg.sender);

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

        delete requestMap[msg.sender][subjectAddr];
        delete requestMap[subjectAddr][msg.sender];

        // REMOVED:essentially the same
        // requestMap[msg.sender][subjectAddr] = false;
        // requestMap[subjectAddr][msg.sender] = false;
        emit RejectSubjectRequest(msg.sender, subjectAddr);
    }

    function getApprovedReqList()
        public
        view
        onlyIssuerSubject
        returns (address[] memory)
    {
        address[] memory reqHist = reqHistMap[msg.sender];
        address[] memory newList = new address[](reqHist.length);
        uint256 y = 0;
        for (uint256 i = 0; i < reqHist.length; i++) {
            // check if issuer approve subject and student make req to issuer
            if (
                requestMap[msg.sender][reqHist[i]] &&
                requestMap[reqHist[i]][msg.sender]
            ) {
                // Get all valid request
                newList[y] = reqHist[i];
                y++;
            }
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
        address[] memory newList = new address[](reqHist.length);
        uint256 y = 0;
        for (uint256 i = 0; i < reqHist.length; i++) {
            // check if issuer approve subject and student make req to issuer
            if (
                !(requestMap[msg.sender][reqHist[i]] &&
                    requestMap[reqHist[i]][msg.sender])
            ) {
                // Get all valid request
                newList[y] = reqHist[i];
                y++;
            }
        }
        return newList;
    }

    // Get all request history regardless of approve/deny
    function getReqList()
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
        if (requestMap[addr][msg.sender] && requestMap[msg.sender][addr]) {
            return true;
        }
        return false;
    }

    // for I>S, check user requested
    function getRequestStatus(address subjectAddr)
        public
        view
        onlyValidRoles("Issuer")
        userExist(subjectAddr, "Subject")
        returns (bool)
    {
        return requestMap[subjectAddr][msg.sender];
    }

    // for I>S, check if issuer have deny before
    function getIssueStatus(address subjectAddr)
        public
        view
        onlyValidRoles("Issuer")
        userExist(subjectAddr, "Subject")
        returns (bool)
    {
        return requestMap[msg.sender][subjectAddr];
    }

    // for V>S, check grant list
    function getAccessStatus(address subjectAddr)
        public
        view
        onlyValidRoles("Verifier")
        userExist(subjectAddr, "Subject")
        returns (bool)
    {
        return grantMap[subjectAddr][msg.sender];
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

        // record grant given by Subject
        grantMap[msg.sender][verifierAddr] = true;
        grantHistMap[msg.sender].push(verifierAddr);

        // record grant given to Verifier
        grantMap[verifierAddr][msg.sender] = true;
        grantHistMap[verifierAddr].push(msg.sender);

        emit GiveAccessViewing(msg.sender, verifierAddr);
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

        delete grantMap[verifierAddr][msg.sender]; // remove access for verifier
        delete grantMap[msg.sender][verifierAddr]; // remove access given by S>V

        emit DenyAccessViewing(msg.sender, verifierAddr);
    }

    // Getters and Setters

    // S>V
    //Frontend[subject]: loop thr all verifier addresses to display the list of verifiers approved by the subject.
    function checkVerifier(address verifier)
        public
        onlyValidRoles("Subject")
        userExist(verifier, "Verifier")
        returns (bool)
    {
        bool status = grantMap[msg.sender][verifier];
        emit ViewVerifierStatus(msg.sender, status);
        return status;
    }

    // V>S
    //Frontend[verifier]: loop thr all subject addresses to display the list of subjects viewable by the verifier.
    function checkSubject(address subject)
        public
        onlyValidRoles("Verifier")
        userExist(subject, "Subject")
        returns (bool)
    {
        bool status = grantMap[subject][msg.sender];
        emit ViewSubjectStatus(msg.sender, status);
        return status;
    }

    // S>V: Subject can view verifier they given access to.
    // V>S: Verifier can view subject they given access from.
    function getGrantList() public view returns (address[] memory) {
        require(
            keccak256(abi.encodePacked(certNetwork.getUserRole(msg.sender))) ==
                keccak256(abi.encodePacked("Subject")) ||
                keccak256(
                    abi.encodePacked(certNetwork.getUserRole(msg.sender))
                ) ==
                keccak256(abi.encodePacked("Verifier")),
            "Only authorized roles can perform this action."
        );
        address[] memory grantList = grantHistMap[msg.sender];
        address[] memory newList = new address[](grantList.length);
        uint256 y = 0;
        for (uint256 i = 0; i < grantList.length; i++) {
            if (
                grantMap[msg.sender][grantList[i]] &&
                grantMap[grantList[i]][msg.sender]
            ) {
                newList[y] = grantList[i];
                y++;
            }
        }
        return grantHistMap[msg.sender];
    }

    // S>V: Subject can view verifier they given access to.
    // V>S: Verifier can view subject they given access from.
    function getDenyList() public view returns (address[] memory) {
        require(
            keccak256(abi.encodePacked(certNetwork.getUserRole(msg.sender))) ==
                keccak256(abi.encodePacked("Subject")) ||
                keccak256(
                    abi.encodePacked(certNetwork.getUserRole(msg.sender))
                ) ==
                keccak256(abi.encodePacked("Verifier")),
            "Only authorized roles can perform this action."
        );
        address[] memory grantList = grantHistMap[msg.sender];
        address[] memory newList = new address[](grantList.length);
        uint256 y = 0;
        for (uint256 i = 0; i < grantList.length; i++) {
            if (
                !(grantMap[msg.sender][grantList[i]] &&
                    grantMap[grantList[i]][msg.sender])
            ) {
                newList[y] = grantList[i];
                y++;
            }
        }
        return grantHistMap[msg.sender];
    }

    // For testing gasCost for any inefficiency
    function GasCost(function() internal returns (string memory) fun)
        internal
        returns (uint256)
    {
        uint256 u0 = gasleft();
        string memory sm = fun();
        uint256 u1 = gasleft();
        uint256 diff = u0 - u1;
        return diff;
    }
}
