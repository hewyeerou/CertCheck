pragma solidity >=0.5.0;
import "./CertificateNetwork.sol";

contract Certificate {
    CertificateNetwork certNetwork;
    uint256 internal totalCert; // Total Counter Added CertNo + track certId

    mapping(uint256 => Cert) private certsMap; // all created certs
    mapping(uint256 => bool) private certExistMap; // T - cert is valid , F - cert is revoked, got record means created before
    mapping(address => uint256[]) private studentToCertMap; // map student to issued certs(by certId) by issuers

    mapping(address => address[]) private certRequestMap; //S>I, request for cert
    mapping(address => address[]) private studentToVerifierMap; // S>V, map student to all approved verifiers to view all certs

    // TODO: JK,SK,XR -> feel free to add any mappings desirable
    //mapping(address => address[]) private verifierToStudentMap;
    //mapping(address => uint256) private verifierToCertMap;

    // Events
    event IssuedCertificate(string certId, address issuerAddr);
    event RevokeCertificate(string certId);
    event RequestCertificate(address studentAddr, address issuerAddr);
    event giveAccessViewing(
        uint256 cert,
        address studentAddr,
        address verifierAddr
    );
    event denyAccessViewing(
        uint256 cert,
        address studentAddr,
        address verifierAddr
    );

    // Structs
    struct Cert {
        address owner; // issued by sch first then student owns the contract
        address issuerAddr; // issuer address
        string issuerName;
        string creationDate; // cert creation date
        string studName; // student name
        string nric; // s9673333A
        string matricNo; //student admin no, e.g A0200100X
        string title; // cert title
        string rollNumber;
        string completionDate; // date student completed the cert requirements
        string details; // modules taken, etc.
    }

    struct certViewingRecord {
        // additional function if we want to see who seen our cert before
        address requestedBy;
        string createdOn;
    }

    constructor(CertificateNetwork cn) public {
        certNetwork = cn;
        totalCert = 0;
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

    // Used to check if a user exist, i.e. issue cert to student, check if that student exist in our system.
    modifier userExist(address addr, string memory role) {
        require(
            certNetwork.checkUserExist(addr, role),
            "This action can only be performed by user in our network."
        );
        _;
    }
    modifier certExist(uint256 certId) {
        require(certExistMap[certId], "Cert ID number does not exist.");
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
    // Request cert from issuer. (STUDENT -> ISSUER)
    // Issue: student can spam request for each issuer without being a student
    // Assumptions:
    // 1. Student know school block addr
    // 2. Student belongs to the school and is legitamite.
    // 3. Student only needs to request from the sch once for a sch to send all the students cert.
    // function requestCert(address issuerAddr)
    //     public
    //     onlyValidRoles("Student")
    //     userExist(issuerAddr, "Issuer")
    // {
    //     require(
    //         !certRequestMap[msg.sender].includes(issuerAddr),
    //         "You have already requested for a cert."
    //     );
    //     certRequestMap[msg.sender].push(issuerAddr); // A student can send request to many issuer
    //     certRequestMap[issuerAddr].push(msg.sender); // An issuer can have request from many student
    //     // TODO: sort list after push for easier retrival?

    //     emit RequestCertificate(msg.sender, issuerAddr); // Question: do we need date?
    // }

    // // TODO: Xie Ran
    // // Grant access to a verifier to viewing all student certs.(STUDENT -> VERIFIER)
    // function grantVerifier(address verifier)
    //     public
    //     userExist(verifier)
    //     onlyValidRoles("Student")
    // {
    //     require(
    //         !certRequestMap[msg.sender].includes(verifier),
    //         "Verifier has already been given access."
    //     );
    //     // TODO: approve all certs for viewing for verifier addr
    //     // TODO: update mappings

    //     // TODO: emit event
    //     emit giveAccessViewing(Cert, verifier);
    // }

    // // TODO:Xie Ran
    // // Deny access to a verifier to viewing all student certs.(STUDENT -> VERIFIER)
    // function denyVerifier(uint256 certId, address verifier)
    //     public
    //     userExist(verifier)
    //     onlyValidRoles("Student")
    // {
    //     require(
    //         certRequestMap[msg.sender].includes(verifier),
    //         "Verifier has already been denied access."
    //     );
    //     // TODO: remove verifier from mappings etc
    //     // certsMap[cert].viewerList.pop(verifier); // add to viewing list

    //     // TODO: emit event
    //     emit denyAccessViewing(Cert, verifier);
    // }

    // // TODO: ShiKai
    // function issueCertificate(
    //     address studentAddr,
    //     string memory _name,
    //     string memory _nric,
    //     string memory _matricNo,
    //     string memory _title,
    //     string memory _completionDate,
    //     string memory _rollNumber,
    //     string memory _issuerName
    // ) public onlyValidRoles("Issuer") returns (bool Status) {
    //     require(
    //         !certRequestMap[msg.sender].includes(issuerAddr),
    //         "Student has not request for a new cert."
    //     );
    //     // new cert object before transfer to student
    //     uint256 newCertId = totalCert++;

    //     Cert memory newCert = Cert(
    //         msg.sender,
    //         address, // issuer addr
    //         _name,
    //         _issuerName,
    //         _nric,
    //         _matricNo, // question: is this the same as roll number => no
    //         _title,
    //         _completionDate,
    //         _rollNumber
    //     );

    //     certsMap[newCertId] = newCert; // add to cert mapping
    //     certExistMap[newCertId] = true; // for cert exist modifier
    //     studentToCertMap[msg.sender].push(newCert); //add to list of stud certs

    //     emit IssuedCertificate(newCertId, msg.sender); // Log event

    //     return true;
    // }

    // // TODO: JK
    // // Delete cert in case of wrong issue or revoked.
    // // Assumption:
    // // 1. we do not delete the cert block, but set the existence to false to indicate it was deleted
    // function revokeCert(uint256 certId)
    //     public
    //     onlyCertIssuer
    //     certExist(certId)
    //     validCertId(certId)
    // {
    //     address studAddr = certsMap[certId].owner; // get owner of cert
    //     certExistMap[certId] = false; // for cert exist modifier

    //     //TODO: Traverse through mapping list to delete cert from student list of certs, whats the best way?
    //     //studentToCertMap[msg.sender].pop(newCert); //add to list of stud certs

    //     delete certsMap[certId]; // Remove from mapping

    //     emit RevokeCertificate(msg.sender, certId);
    // }

    // TODO: SK -> Getter and setter for all the cert attributes.
    // TODO: JK,SK,XR -> include relevant Getters and setters for cert
}
