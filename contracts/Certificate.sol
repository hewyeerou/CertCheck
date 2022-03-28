pragma solidity >=0.5.0;
import "./CertificateNetwork.sol";

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

    // TODO: JK,SK,XR -> feel free to add any mappings desirable
    //
    //mapping(address => mapping(address => bool)) private verifierToSubjectMap;
    //V>(S>bool), map verifier to all subjects he/she can view certs
    //mapping(address => uint256) private verifierToCertMap;

    // Events
    event IssuedCertificate(
        uint256 certId,
        address issuerAddr,
        address subjectAddr
    );
    event RevokeCertificate(address issuer, uint256 certId);
    event RequestCertificate(address subjectAddr, address issuerAddr);
    event giveAccessViewing(address subjectAddr, address verifierAddr);
    event denyAccessViewing(address subjectAddr, address verifierAddr);
    event viewSubjectCerts(address verifierAddr, address subjectAddr);
    event viewVerifierStatus(address subjectAddr, bool status);
    event viewSubjectStatus(address verifierAddr, bool status);

    // Structs
    struct Cert {
        address owner; // Subject address
        address issuerAddr; // Issuer address
        string issuerName; // (NUS,NTU,Coursera,LinkedIn)
        uint256 creationDate; // cert creation date
        string nric; // s9673333A
        string matricNo; //subject admin no, e.g A0200100X, Question- same as rollNumber?
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

        requestMap[msg.sender][issuerAddr] = true;

        emit RequestCertificate(msg.sender, issuerAddr); // Question: do we need date?
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

        emit giveAccessViewing(msg.sender, verifierAddr);
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

        emit denyAccessViewing(msg.sender, verifierAddr);
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
        string memory _matricNo,
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

        uint256 newCertId = totalCert++; // new cert id before transfer to subject
        uint256 _creationDate = block.timestamp;

        Cert memory newCert = Cert(
            subjectAddr,
            msg.sender,
            _issuerName,
            _creationDate,
            _nric,
            _matricNo,
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
        issuerToCertMap[subjectAddr][certId] = false; // remove mapping

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
        returns (uint256[] memory)
    {
        require(
            subjectToVerifierMap[subjectAddr][msg.sender],
            "You have no viewing access for the subject certificates."
        );
        uint256[] memory certList = subjectToCertListMap[subjectAddr];
        uint256[] memory newList = new uint256[](certList.length);

        for (uint256 i = 0; i < certList.length; i++) {
            if (subjectToCertMap[subjectAddr][certList[i]]) {
                // Get all viewable certs
                newList[i] = certList[i];
                // newList.push(certsMap[certList[i]]) // Push entire cert struct
            } else {
                newList[i] = 0;
            }
        }
        //TODO: return emptyList if no data
        return newList;
    }

    function getCertListSubjects(address subjectAddr)
        public
        view
        userExist(subjectAddr, "Subject")
        returns (uint256[] memory)
    {
        // Redundant require since we already retriving from list belonging to addr.
        require(
            subjectAddr == certsMap[subjectToCertListMap[subjectAddr][0]].owner,
            "Only certificate owner can perform this action."
        );

        uint256[] memory certList = subjectToCertListMap[subjectAddr];
        uint256[] memory newList = new uint256[](certList.length);

        for (uint256 i = 0; i < certList.length; i++) {
            if (subjectToCertMap[subjectAddr][certList[i]]) {
                // Get all viewable certs
                newList[i] = certList[i];
                // newList.push(certsMap[certList[i]]) // Push entire cert struct
            } else {
                newList[i] = 0;
            }
        }
        //TODO: return emptyList if no data
        return newList;
    }

    function getCertListIssuers(address issuerAddr)
        public
        view
        userExist(issuerAddr, "Issuer")
        returns (uint256[] memory)
    {
        // Redundant require since we already retriving from list belonging to addr.
        require(
            issuerAddr ==
                certsMap[issuerToCertListMap[issuerAddr][0]].issuerAddr,
            "Only certificate issuer can perform this action."
        );

        uint256[] memory certList = issuerToCertListMap[issuerAddr];
        uint256[] memory newList = new uint256[](certList.length);

        for (uint256 i = 0; i < certList.length; i++) {
            if (issuerToCertMap[issuerAddr][certList[i]]) {
                // Get all viewable certs
                newList[i] = certList[i];
                // newList.push(certsMap[certList[i]]) // Push entire cert struct
            } else {
                newList[i] = 0;
            }
        }

        //TODO: return emptyList if no data
        return newList;
    }

    // TODO: SK -> Getter and setter for all the cert attributes.
    // @notice Function for verifier to view certs of a student
    // @dev Checks for approval of viewing right of validator then returns all certs of student
    // @param student address of student
    // function getAllCerts(address subjectAddr)
    //     public
    //     userExist(subjectAddr, "Subject")
    //     returns (uint256[] memory)
    // {
    //     address verifierList = studentToVerifierMap[student];
    //     bool granted = false;
    //     for (uint256 i = 0; i < verifierList.length; i++) {
    //         if (verifierList[i] == msg.sender) {
    //             granted = true;
    //             break;
    //         }
    //     }
    //     require(granted, "Not granted access to view");
    //     return studentToCertMap[student];
    // }

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
    //THIS IS NOT FOR A SUBJECT TO VIEW HIS/HER OWN CERTS, IT'S FOR VERIFIERS ONLY.
    // function getSubjectCerts(address subject)
    //     public
    //     onlyValidRoles("Verifier")
    //     userExist(subject, "Subject")
    //     returns (uint256[] memory)
    // {
    //     require(
    //         subjectToVerifierMap[subject][msg.sender],
    //         "You are not authorised to view this subject's certificates."
    //     );

    //     emit viewSubjectCerts(msg.sender, subject);
    //     return subjectToCertMap[subject]; //may need to change if jk modifies the mapping
    // }

    //Frontend[verifier]: display all certs under the subject for the verifier.

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
    //TODO: getOwnCerts() function for subjects to view his/her own certs.
    //TODO: checkRequest(subjectAddr) function to check all request from a subject
    //TODO: checkGrantList(subjectAddr) function to check all grants for subject
    //TODO: checkGrantList(verifierAddr) function to check all grants for verifier
}
