pragma solidity >=0.5.0;
import "./CertificateNetwork.sol";
pragma experimental ABIEncoderV2;

contract Certificate {
    CertificateNetwork certNetwork;
    uint256 internal totalCert; // Total Counter Added CertNo + track certId

    mapping(uint256 => Cert) private certsMap; // all created certs
    mapping(uint256 => bool) private certExistMap; // T - cert is valid , F - cert is revoked, got record means created before
    mapping(address => uint256[]) private subjectToCertListMap; // map subject to issued certs(by certId) by issuers
    mapping(address => uint256[]) private issuerToCertListMap; // map issuer to issued certs(by certId)

    mapping(address => mapping(address => bool)) private subjectToVerifierMap; // S>(V>bool), map subject to all approved verifiers to view all certs
    mapping(address => mapping(uint256 => bool)) private subjectToCertMap;
    mapping(address => mapping(uint256 => bool)) private issuerToCertMap;
    mapping(address => mapping(address => bool)) private requestMap;

    mapping(address => address[]) private reqListMap;
    mapping(address => address[]) private grantListMap;

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

    // Structs
    struct Cert {
        uint256 certId; //Get CertId
        address owner; // Subject address
        address issuerAddr; // Issuer address
        string issuerName; // (NUS,NTU,Coursera,LinkedIn)
        uint256 creationDate; // cert creation date
        string nric; // s9673333A
        string serialNo; //https://www.ibm.com/docs/en/ibm-mq/7.5?topic=certificates-what-is-in-digital-certificate
        string title; // cert title
        string completionDate; // date which subject completed the cert requirements
        // remove variables:
        // string studName; // subject name
        // string rollNumber; //unique identification number that can be assigned to a SUBJECT during admission.
        // string details; // modules taken, etc.
    }

    constructor(CertificateNetwork cn) public {
        certNetwork = cn;
        totalCert = 1;
    }

    // Modifiers

    // Used for functions with specific roles
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

    // Used this for determining valid cert
    modifier validCertId(uint256 certId) {
        require(certId < totalCert);
        _;
    }
    modifier onlyCertOwner(uint256 certId) {
        require(
            certsMap[certId].owner == msg.sender,
            "This action can only be performed by the certificate owner."
        );
        _;
    }
    modifier onlyCertIssuer(uint256 certId) {
        require(
            certsMap[certId].issuerAddr == msg.sender,
            "This action can only be performed by the certificate issuer."
        );
        _;
    }

    // TODO: JAOKUEAN
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

        
        reqListMap[msg.sender].push(issuerAddr);
        reqListMap[issuerAddr].push(msg.sender);

        emit RequestCertificate(msg.sender, issuerAddr);
    }

    // Approve student request before you can issue cert
    function acceptRequest(address subjectAddr)
        public
        onlyValidRoles("Issuer")
        userExist(subjectAddr, "Subject")
    {
        require(
            requestMap[subjectAddr][msg.sender],
            "Subject has not made a request."
        );
        require(
            !requestMap[msg.sender][subjectAddr],
            "Subject has already been approved."
        );
        requestMap[msg.sender][subjectAddr] = true;

        emit AcceptSubjectRequest(msg.sender, subjectAddr);
    }

    function rejectRequest(address subjectAddr)
        public
        onlyValidRoles("Issuer")
        userExist(subjectAddr, "Subject")
    {
        require(
            requestMap[subjectAddr][msg.sender],
            "Subject has not request for a new cert."
        );

        requestMap[msg.sender][subjectAddr] = false;
        requestMap[subjectAddr][msg.sender] = false;
        emit RejectSubjectRequest(msg.sender, subjectAddr);
    }

    // TODO: Xie Ran
    // Grant access to a verifier to viewing all subject certs.(SUBJECT -> VERIFIER)
    function grantVerifier(address verifierAddr)
        public
        onlyValidRoles("Subject")
        userExist(verifierAddr, "Verifier")
    {
        require(
            !subjectToVerifierMap[msg.sender][verifierAddr],
            "Verifier has already been given access."
        );

        subjectToVerifierMap[msg.sender][verifierAddr] = true;
        subjectToVerifierMap[verifierAddr][msg.sender] = true;

        grantListMap[msg.sender].push(verifierAddr);
        grantListMap[verifierAddr].push(msg.sender);

        emit GiveAccessViewing(msg.sender, verifierAddr);
    }

    // TODO:Xie Ran
    // Deny access to a verifier to viewing all subject certs.(SUBJECT -> VERIFIER)
    function denyVerifier(address verifierAddr)
        public
        onlyValidRoles("Subject")
        userExist(verifierAddr, "Verifier")
    {
        require(
            subjectToVerifierMap[msg.sender][verifierAddr],
            "Verifier has already been denied access."
        );

        subjectToVerifierMap[msg.sender][verifierAddr] = false;
        subjectToVerifierMap[verifierAddr][msg.sender] = false;

        emit DenyAccessViewing(msg.sender, verifierAddr);
    }

    // TODO: ShiKai
    // address owner; // Subject address
    // address issuerAddr; // Issuer address
    // string issuerName; // (NUS,NTU,Coursera,LinkedIn)
    // string creationDate; // cert creation date
    // string nric; // s9673333A
    // string matricNo; //subject admin no, e.g A0200100X
    // string title; // cert title
    // string completionDate; // date which subject completed the cert requirements
    function issueCertificate(
        address subjectAddr,
        string memory _issuerName,
        string memory _nric,
        string memory _serialNo,
        string memory _title,
        string memory _completionDate
    )
        public
        onlyValidRoles("Issuer")
        userExist(subjectAddr, "Subject")
        returns (bool Status)
    {
        require(
            requestMap[subjectAddr][msg.sender],
            "Subject has not request for a new cert."
        );
        require(
            requestMap[msg.sender][subjectAddr],
            "Student has not been approve."
        );

        uint256 newCertId = totalCert++; // new cert id before transfer to subject
        uint256 _creationDate = block.timestamp;

        Cert memory newCert = Cert(
            newCertId,
            subjectAddr,
            msg.sender,
            _issuerName,
            _creationDate,
            _nric,
            _serialNo,
            _title,
            _completionDate
        );

        //TODO: Check for duplicate cert details?
        certsMap[newCertId] = newCert; // add to cert mapping
        certExistMap[newCertId] = true; // for cert exist modifier

        subjectToCertListMap[subjectAddr].push(newCertId); // add to subject list of certs
        subjectToCertMap[subjectAddr][newCertId] = true;

        issuerToCertListMap[msg.sender].push(newCertId); // add to issuer list of certs
        issuerToCertMap[msg.sender][newCertId] = true;

        emit IssuedCertificate(newCertId, msg.sender, subjectAddr); // Log event

        return true;
    }

    // TODO: JK
    // Delete cert in case of wrong issue or revoked.
    // Assumption:
    // 1. we do not delete the cert block, but set the existence to false to indicate it was deleted
    // Question - Do we keep the certExist or just erase from existence?
    function revokeCert(uint256 certId)
        public
        onlyValidRoles("Issuer")
        onlyCertIssuer(certId)
        validCertId(certId)
    {
        require(
            certExistMap[certId],
            "The certificate has already been revoked."
        );

        address subjectAddr = certsMap[certId].owner; // get owner of cert
        certExistMap[certId] = false; // for cert exist modifier
        subjectToCertMap[subjectAddr][certId] = false; // remove mapping
        issuerToCertMap[msg.sender][certId] = false; // remove mapping

        delete certsMap[certId]; // Remove from mapping, cert does not exist anymore

        emit RevokeCertificate(msg.sender, certId);
    }

    // Alternate code to retrieve all certs from a subject
    // Verifiers > Subject
    // return all viewable certIDs
    // can be extended to retrieve all struct info.
    function getCertListVerifiers(address subjectAddr)
        public
        view
        onlyValidRoles("Verifier")
        userExist(subjectAddr, "Subject")
        returns (Cert[] memory)
    {
        require(
            subjectToVerifierMap[subjectAddr][msg.sender],
            "You have no viewing access for the subject certificates."
        );
        uint256[] memory certList = subjectToCertListMap[subjectAddr];
        Cert[] memory newList = new Cert[](certList.length);
        uint256 y = 0;
        for (uint256 i = 0; i < certList.length; i++) {
            if (subjectToCertMap[subjectAddr][certList[i]]) {
                // Get all viewable certs
                newList[y] = certsMap[certList[i]];
                y ++;
                // newList.push(certsMap[certList[i]]) // Push entire cert struct
            }
        }
        return newList;
    }

    function getCertListSubjects()
        public
        view
        onlyValidRoles("Subject")
        returns (uint256[] memory)
    {
        uint256[] memory certList = subjectToCertListMap[msg.sender];
        uint256[] memory newList = new uint256[](certList.length);
        for (uint256 i = 0; i < certList.length; i++) {
            if (subjectToCertMap[msg.sender][certList[i]]) {
                // Get all viewable certs
                newList[i] = certList[i];
                // newList.push(certsMap[certList[i]]) // Push entire cert struct
            }
        }
        return newList;
    }

    function getCertListIssuers()
        public
        view
        onlyValidRoles("Issuer")
        returns (Cert[] memory)
    {
        uint256[] memory certList = issuerToCertListMap[msg.sender];
        Cert[] memory newList = new Cert[](certList.length);
        uint256 y = 0;
        for (uint256 i = 0; i < certList.length; i++) {
            if (issuerToCertMap[msg.sender][certList[i]]) {
                // Get all viewable certs
                // newList[i] = certList[i];
                newList[y] = certsMap[certList[i]];
                y ++;
            }
        }
        return newList;
    }

    // Getters and Setters

    //getters by XR:
    //for a subject to check the viewing rights of a verifier
    function checkVerifier(address verifier)
        public
        onlyValidRoles("Subject")
        userExist(verifier, "Verifier")
        returns (bool)
    {
        bool status = subjectToVerifierMap[msg.sender][verifier];
        emit ViewVerifierStatus(msg.sender, status);
        return status;
    }

    //Frontend[subject]: loop thr all verifier addresses to display the list of verifiers approved by the subject.

    //for a verifier to check whether he/she can view a subject's certs
    function checkSubject(address subject)
        public
        onlyValidRoles("Verifier")
        userExist(subject, "Subject")
        returns (bool)
    {
        bool status = subjectToVerifierMap[subject][msg.sender];
        emit ViewSubjectStatus(msg.sender, status);
        return status;
    }

    //Frontend[verifier]: loop thr all subject addresses to display the list of subjects viewable by the verifier.

    //function to check a request from a subject
    function checkRequest(address issuerAddr)
        public
        view
        returns (bool)
    {
        if (
            requestMap[issuerAddr][msg.sender] &&
            requestMap[msg.sender][issuerAddr]
        ) {
            return true;
        }
        return false;
    }

    // function for subject/issuer to see all request to issuer/subject
    function getApprovedReqList() public view returns (address[] memory) {
        address[] memory reqList = reqListMap[msg.sender];
        address[] memory newList = new address[](reqList.length);

        for (uint256 i = 0; i < reqList.length; i++) {
            // check if issuer approve subject and student make req to issuer
            if (requestMap[msg.sender][reqList[i]]) {
                // Get all viewable certs
                newList[i] = reqList[i];
            }
        }
        return newList;
    }

    // Subject request to Issuer list
    // Issuer request from Subject List
    function getReqList() public view returns (address[] memory) {
        return reqListMap[msg.sender];
    }

    // function for subject/issuer to see all request to issuer/subject
    function getGrantList() public view returns (address[] memory) {
        // address[] memory grantList = grantListMap[msg.sender];
        // address[] memory newList = new address[](grantList.length);

        // for (uint256 i = 0; i < grantList.length; i++) {
        //     // check if issuer approve subject and student make req to issuer
        //     if (subjectToVerifierMap[msg.sender][grantList[i]]) {
        //         // Get all viewable certs
        //         newList[i] = grantList[i];
        //     }
        // }
        return grantListMap[msg.sender];
    }

    function checkCertExist(uint256 certId) public view returns (bool) {
        return certExistMap[certId];
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

    //TODO: getGrantList with actual grant
}
