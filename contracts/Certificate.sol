pragma solidity >=0.5.0;
import "./CertificateNetwork.sol";

contract Certificate {
    CertificateNetwork certNetwork;
    uint256 internal totalCert; // Total Counter Added CertNo + track certId

    mapping(uint256 => Cert) private certsMap; // all created certs
    mapping(uint256 => bool) private certExistMap; // T - cert is valid , F - cert is revoked, got record means created before
    mapping(address => uint256[]) private subjectToCertMap; // map subject to issued certs(by certId) by issuers

    mapping(address => address[]) private certRequestMap; //S>I, request for cert
    mapping(address => mapping(address => bool)) private subjectToVerifierMap; 
    // S>(V>bool), map subject to all approved verifiers to view all certs

    // TODO: JK,SK,XR -> feel free to add any mappings desirable
    //mapping(address => mapping(address => bool)) private verifierToSubjectMap; 
    //V>(S>bool), map verifier to all subjects he/she can view certs
    //mapping(address => uint256) private verifierToCertMap;

    // Events
    event IssuedCertificate(string certId, address issuerAddr);
    event RevokeCertificate(address issuer, uint256 certId);
    event RequestCertificate(address subjectAddr, address issuerAddr);
    event giveAccessViewing(address subjectAddr,address verifierAddr);
    event denyAccessViewing(address subjectAddr,address verifierAddr);
    event viewSubjectCerts(address verifierAddr, address subjectAddr);
    event viewVerifierStatus(address subjectAddr, bool status);
    event viewSubjectStatus(address verifierAddr, bool status);


    // Structs
    struct Cert {
        address owner; // issued by sch first then subject owns the contract
        address issuerAddr; // issuer address
        string issuerName;
        string creationDate; // cert creation date
        string studName; // subject name
        string nric; // s9673333A
        string matricNo; //subject admin no, e.g A0200100X
        string title; // cert title
        string rollNumber;
        string completionDate; // date subject completed the cert requirements
        string details; // modules taken, etc.
    }

    struct certViewingRecord {
        // additional function if we want to see who seen our cert before
        address requestedBy;
        string createdOn;
    }

    constructor(CertificateNetwork cn) {
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

    // Used to check if a user exist, i.e. issue cert to subject, check if that subject exist in our system.
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
        //require(
            //!certRequestMap[msg.sender].includes(issuerAddr),
           // "You have already requested for a cert."
        //);
        certRequestMap[msg.sender].push(issuerAddr); // A subject can send request to many issuer
        certRequestMap[issuerAddr].push(msg.sender); // An issuer can have request from many subject
        // TODO: sort list after push for easier retrival?

        emit RequestCertificate(msg.sender, issuerAddr); // Question: do we need date?
    }

    // TODO: Xie Ran
    // Grant access to a verifier to viewing all subject certs.(STUDENT -> VERIFIER)
    function grantVerifier(address verifier)
        public
        userExist(verifier, "Verifier")
        onlyValidRoles("Subject")
    {
        require(
            !subjectToVerifierMap[msg.sender][verifier],
            "Verifier has already been given access."
        );

        // TODO: update mappings
        subjectToVerifierMap[msg.sender][verifier] = true;
        //verifierToSubjectMap[verifier][msg.sender] = true;

        // TODO: emit event
        emit giveAccessViewing(msg.sender, verifier);
    }

    // TODO:Xie Ran
    // Deny access to a verifier to viewing all subject certs.(STUDENT -> VERIFIER)
    function denyVerifier(address verifier)
        public
        userExist(verifier, "Verifier")
        onlyValidRoles("Subject")
    {
        require(
            subjectToVerifierMap[msg.sender][verifier],
            "Verifier access denied already."
        );

        // TODO: remove verifier from the subject's mappings
        subjectToVerifierMap[msg.sender][verifier] = false;
        //remove subject for the verifier's mapping
        //verifierToSubjectMap[verifier][msg.sender] = false; 

        // TODO: emit event
        emit denyAccessViewing(msg.sender, verifier);
    }

    /***
    // TODO: ShiKai
    function issueCertificate(
        address subjectAddr,
        string memory _name,
        string memory _nric,
        string memory _matricNo,
        string memory _title,
        string memory _completionDate,
        string memory _rollNumber,
        string memory _issuerName
    ) public onlyValidRoles("Issuer") returns (bool Status) {
        require(
            !certRequestMap[msg.sender].includes(msg.sender),
            "Subject has not request for a new cert."
        );
         new cert object before transfer to subject
        uint256 newCertId = totalCert++;

        Cert memory newCert = Cert(
            msg.sender,
            address, // issuer addr
            _name,
            _issuerName,
            _nric,
            _matricNo, // question: is this the same as roll number => no
            _title,
            _completionDate,
            _rollNumber
        );

        certsMap[newCertId] = newCert; // add to cert mapping
        certExistMap[newCertId] = true; // for cert exist modifier
        subjectToCertMap[msg.sender].push(newCert); //add to list of stud certs

        emit IssuedCertificate(newCertId, msg.sender); // Log event

        return true;
    }
    ***/

    // TODO: JK
    // Delete cert in case of wrong issue or revoked.
    // Assumption:
    // 1. we do not delete the cert block, but set the existence to false to indicate it was deleted
    function revokeCert(uint256 certId)
        public
        onlyCertIssuer(certId)
        certExist(certId)
        validCertId(certId)
    {
        address studAddr = certsMap[certId].owner; // get owner of cert
        certExistMap[certId] = false; // for cert exist modifier

        //TODO: Traverse through mapping list to delete cert from subject list of certs, whats the best way?
        //subjectToCertMap[msg.sender].pop(newCert); //add to list of stud certs

        delete certsMap[certId]; // Remove from mapping

        emit RevokeCertificate(msg.sender, certId);
    }

    // TODO: SK -> Getter and setter for all the cert attributes.
    // TODO: JK,SK,XR -> include relevant Getters and setters for cert

    //getters by XR:
    //for a subject to check the viewing rights of a verifier
    function checkVerifier(address verifier) 
        public 
        onlyValidRoles("Subject") 
        userExist(verifier, "Verifier") 
        returns (bool) 
    {
        bool status = subjectToVerifierMap[msg.sender][verifier];
        emit viewVerifierStatus(msg.sender, status);
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
        emit viewSubjectStatus(msg.sender, status);
        return status;
    }
    //Frontend[verifier]: loop thr all subject addresses to display the list of subjects viewable by the verifier.

    //function for verifier to get the list of cert addresses under a subject
    //only authorised verifiers can get this list to prevent privacy issues.
    //THIS IS NOT FOR A STUDENT TO VIEW HIS/HER OWN CERTS, IT'S FOR VERIFIERS ONLY.
    function getSubjectCerts(address subject) 
        public 
        onlyValidRoles("Verifier") 
        userExist(subject, "Subject") 
        returns (uint256[] memory) 
    {
        require(
            subjectToVerifierMap[subject][msg.sender],
            "You are not authorised to view this subject's certificates."
        );
        
        emit viewSubjectCerts(msg.sender, subject);
        return subjectToCertMap[subject];//may need to change if jk modifies the mapping

    }
    //Frontend[verifier]: display all certs under the subject for the verifier.


    //TO DO: 
    //getOwnCerts() function for subjects to view his/her own certs.
}
