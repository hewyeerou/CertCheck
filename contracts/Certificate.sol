pragma solidity >= 0.5.0;

contract Certificate {
  struct cert {
    string ownerName;
    address ownerAdd;
    string issuerName;
    address issuerAdd;
    string title;
    string rollNumber;
    string completionDate;
    string details;

  }
  address administrator;
  uint256 totalIssued;
  mapping (uint256 => cert) certs;
  constructor () public{
    administrator = msg.sender;
    totalIssued = 0;
  }

  modifier adminOnly () {
    require(msg.sender == administrator);
    _;
  }

  function issue(
    string memory ownerName,
    address ownerAdd,
    string memory issuerName,
    address issuerAdd,
    string memory title,
    string memory rollNumber,
    string memory completionDate,
    string memory details
  ) public adminOnly returns (uint256) {
    cert memory newCert = cert(
      ownerName, ownerAdd, issuerName, issuerAdd, title, rollNumber, completionDate, details
    );
    totalIssued++;
    certs[totalIssued] = newCert;
    return totalIssued;
  }

  function revoke(uint256 id) public adminOnly {
    delete certs[id];
  }

  function get(uint256 id) public view adminOnly {
    
  }
}
