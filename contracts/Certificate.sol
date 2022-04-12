pragma solidity >=0.5.0;
pragma experimental ABIEncoderV2;

import "./CertificateNetwork.sol";
import "./CertificateStore.sol";

contract Certificate {
    CertificateNetwork certNetwork;
    CertificateStore certStore;

    uint256 internal totalCert;

    // Mapping to all created certificates
    mapping(uint256 => Cert) private certsMap;
    mapping(uint256 => bool) private certExistMap;

    // S>C: Valid certs, all issued officially and after denys
    // I>C: Valid certs, all issued officially and after denys
    mapping(address => mapping(uint256 => bool)) private addrToCertMap;

    // S>C: Map subject to all issued certs(by certId) received by issuers
    // I>C: Map issuer to all issued certs(by certId)
    mapping(address => uint256[]) private certHistMap;

    // Events
    event IssuedCertificate(
        uint256 certId,
        address issuerAddr,
        address subjectAddr
    );
    event RevokeCertificate(address issuer, uint256 certId);

    // Structs
    struct Cert {
        uint256 certId; //Get CertId
        address owner; // Subject address
        address issuerAddr; // Issuer address
        string issuerName; // (NUS,NTU,Coursera,LinkedIn)
        uint256 creationDate; // cert creation date
        string nric; // s9673333A
        string serialNo; // Issuer unique cert serial no.
        string title; // cert title
        string completionDate; // date which subject completed the cert requirements
    }

    constructor(CertificateNetwork cn, CertificateStore cs) public {
        certNetwork = cn;
        certStore = cs;
        totalCert = 1;
    }

    // Modifiers
    modifier validCertId(uint256 certId) {
        require(
            certId < totalCert && certExistMap[certId] == true,
            "The certificate not valid."
        );
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

    modifier onlyValidRoles(string memory role) {
        require(
            certNetwork.checkUserExist(msg.sender, role),
            "This action can only be performed by authorized roles."
        );
        _;
    }

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
        returns (uint256)
    {
        require(
            certStore.getRequestStatus(msg.sender, subjectAddr),
            "Subject has not made any request."
        );
        require(
            certStore.getIssueStatus(msg.sender, subjectAddr),
            "Subject is not authorized."
        );

        uint256 newCertId = totalCert++;
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
        // add to cert mapping
        certsMap[newCertId] = newCert;
        certExistMap[newCertId] = true;

        // record subject received cert
        certHistMap[subjectAddr].push(newCertId);
        addrToCertMap[subjectAddr][newCertId] = true;

        // record issuer issued cert
        certHistMap[msg.sender].push(newCertId);
        addrToCertMap[msg.sender][newCertId] = true;

        emit IssuedCertificate(newCertId, msg.sender, subjectAddr); // Log event

        return newCertId;
    }

    // Delete cert in case of wrong issue or revoked.
    // Assumption:
    // 1. we do not delete the cert block, but set the existence to false to indicate it was deleted
    function revokeCert(uint256 certId)
        public
        onlyValidRoles("Issuer")
        onlyCertIssuer(certId)
        validCertId(certId)
    {
        address subjectAddr = certsMap[certId].owner; // get owner of cert
        certExistMap[certId] = false; // record cert revoke
        addrToCertMap[subjectAddr][certId] = false; // remove cert for subject
        addrToCertMap[msg.sender][certId] = false; // remove cert for issuer
        emit RevokeCertificate(msg.sender, certId);
    }

    function getCertListById()
        public
        view
        onlyIssuerSubject
        returns (uint256[] memory)
    {
        uint256[] memory certList = certHistMap[msg.sender];
        uint256[] memory tempList = new uint256[](certList.length);
        uint256 y = 0;
        for (uint256 i = 0; i < certList.length; i++) {
            if (addrToCertMap[msg.sender][certList[i]]) {
                tempList[y] = certList[i]; // Get all viewable certs
                y++;
            }
        }
        uint256[] memory newList = new uint256[](y);
        for (uint256 i = 0; i < y; i++) {
            newList[i] = tempList[i];
        }
        return newList;
    }

    function getCerts() public view onlyIssuerSubject returns (Cert[] memory) {
        uint256[] memory certList = certHistMap[msg.sender];
        Cert[] memory tempList = new Cert[](certList.length);
        uint256 y = 0;
        for (uint256 i = 0; i < certList.length; i++) {
            if (addrToCertMap[msg.sender][certList[i]]) {
                tempList[y] = certsMap[certList[i]];
                y++;
            }
        }
        Cert[] memory newList = new Cert[](y);
        for (uint256 i = 0; i < y; i++) {
            newList[i] = tempList[i];
        }
        return newList;
    }

    function getCertsRevokedList()
        public
        view
        onlyIssuerSubject
        returns (Cert[] memory)
    {
        uint256[] memory certList = certHistMap[msg.sender];
        Cert[] memory tempList = new Cert[](certList.length);
        uint256 y = 0;
        for (uint256 i = 0; i < certList.length; i++) {
            if (!addrToCertMap[msg.sender][certList[i]]) {
                tempList[y] = certsMap[certList[i]]; // Push entire cert struct
                y++;
            }
        }
        Cert[] memory newList = new Cert[](y);
        for (uint256 i = 0; i < y; i++) {
            newList[i] = tempList[i];
        }
        return newList;
    }

    function getCertListVerifiers(address subjectAddr)
        public
        view
        onlyValidRoles("Verifier")
        userExist(subjectAddr, "Subject")
        returns (Cert[] memory)
    {
        require(
            certStore.getAccessStatus(msg.sender, subjectAddr),
            "You have no viewing access for the subject certificates."
        );
        uint256[] memory certList = certHistMap[subjectAddr];
        Cert[] memory tempList = new Cert[](certList.length);
        uint256 y = 0;
        for (uint256 i = 0; i < certList.length; i++) {
            if (addrToCertMap[subjectAddr][certList[i]]) {
                tempList[y] = certsMap[certList[i]];
                y++;
            }
        }
        Cert[] memory newList = new Cert[](y);
        for (uint256 i = 0; i < y; i++) {
            newList[i] = tempList[i];
        }
        return newList;
    }

    function checkCertExist(uint256 certId)
        public
        view
        validCertId(certId)
        returns (bool)
    {
        return certExistMap[certId];
    }
}
