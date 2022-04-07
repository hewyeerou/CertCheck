# IS4302_Project - Skill Verification System

Create Metamask here:
https://asifwaquar.com/connect-metamask-to-localhost/

Following guides here:
https://trufflesuite.com/boxes/react/index.html

---

# Remix Test run

### Deployment phase

- Deploy CertNetwork.sol w admin account (acc1)
- Deploy CertStore.sol w CertNetwork contract addr
- Deploy Cert.sol with CertNetwork contract addr + CertStore contract addr
- Create user+role accounts w CertNetwork contract
  - subject (acc2) : 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2
  - subject (acc3) : 0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db
  - verifier (acc4) : 0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB
  - verifier (acc5) : 0x617F2E2fD72FD9D5503197092aC168c91465E7f2
  - issuer (acc6) : 0x17F6AD8Ef982297579C203069C1DbfFE4348c372
  - issuer (acc7) : 0x5c6B0f7Bf3E7ce046039Bd8FABdfD3f9F5021678
  - unkown user(acc8) : 0x03C6FcED478cBbC9a4FAB34eF9f40767739D1Ff7

---

### Request Phase
### Description
- CertStore.sol: Subject > Issuer, request for certificate

### Test Case:
1. Test Authorized users with valid roles can use specifc functions 
2. Test if Subject can make a request twice in a row.
3. Test that Issuer can only reject a Subject that requested only.
4. Test if approve and reject request tally with reqHistMap for each user.

### Prerequisite:

1. All 3 contract have been deployed
2. User accounts created

- Subject(acc2) request Issuer(acc6)
  - [ ] TEST: use acc4 to request (acc6) > FALSE, only authorised roles
  - [ ] TEST: use acc2 to request (acc3) another student/verifier> user w valid role
- Subject(acc2) request Issuer(acc7)
- Using acc2 check reqList to reflect changes (acc6 + acc7 )
  - [ ] TEST: use acc2 to request again>FALSE , already requested
- Issuer(acc6) reject request (acc2) after checking student records
  - [ ] TEST: use acc3 to reject (acc2) > FALSE, only authorised roles
  - [ ] TEST: use acc6 to reject (acc3) > FALSE, only requested
- Check if changes are reflected by using getApprovedReqList + getRejectedReqList
  - [ ] ISSUER CHECK
  - [ ] SUBJECT CHECK

---

### Issue Phase
### Description
- Issuer>Subject, issuer starts issuing certs.

### Test Case:
1. Test Authorized users with valid roles can use specifc functions. 
2. Test if Subject/Verifier can issue cert to themselves.
3. Test if Issuer can only issue cert to a subject whom has made a request.

### prerequisite:

1. acc2 have requested for issuer(acc6) to issue cert
2. acc6 have approved

- Issuer(acc6) call issueCert (0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2, NUS, s9622222A, a0200100Y, degree, 11/11/2022) to Subject(acc2) x3
  - [ ] TEST: use acc6 to issue subject(acc3) w no request > FALSE, prompt no request from subject
  - [ ] TEST: use acc7 to issue subject(acc2) > FALSE, prompt no request from subject
  - [ ] TEST: use acc4 to issue subject(acc2) > FALSE, only authorised roles, check verifier cannot issue certs.
- Check subject(acc2) list of cert using getCertListById() + getCertsRevokedList()
  - OUT > uint256[]: 1,2,3, + uint256[]: []
- Check Issuer(acc6) list of cert using getCertListById() getCertsRevokedList()
  - OUT> uint256[]: 1,2,3 + uint256[]: []
  - TODO: prevent duplicate cert to be uploaded on blockchain
- Issuer(acc7) call issueCert () to Subject(acc2) x2 , CertId 4 and 5
- Check subject(acc2) list of cert using getCertListById()
  - OUT > uint256[]: 1,2,3,4,5

---

## Revoke cert

### Test Case:
1. Test Authorized users with valid roles can use specifc functions. 
2. Test if only cert issuer can revoke cert.
3. Test if verifier/subject/any other issuer cannot revoke cert.

### prerequisite:

1. acc2 have certs issued(certid: 1,2,3) by issuer

- using acc6 revoke("2")
  - TEST: using another issuer addr(acc7) to revoke > FALSE, only by certificate issuers
  - TEST: using another random addr(acc4) to revoke > FALSE, only authorised roles, check verifier cannot revoke certs.
- using acc7 revoke("4")
- Check subject(acc2) list of cert using getCertListById() + getCertsRevokedList()
  - OUT > uint256[]: 1,3,5 + uint256[]: 2,4
- Check Issuer(acc6) list of cert using getCertListById() + getCertsRevokedList()
  - OUT > uint256[]: 1,3,5 + uint256[]: 2,4

---

## Grant access
### Description
Student>Verifier, Grant access
### Test Case:
1. Test Authorized users with valid roles can use specifc functions. 
2. Test if only subject can give access to only verifiers and not issuers.
3. Test if verifier can view all cert even after newly issued cert.

### prerequisite: acc2 have certs issued(certid: 1,3,5) by issuer after revoking(certid: 2,4)

- Using acc2, Grant verifier (acc4)
  - [ ] TEST: verifier can give himself access addr(acc4) to grant> FALSE, by authorised roles
  - [ ] TEST: using another random addr(acc5) to grant > FALSE, only authorised roles
  - [ ] TEST: using another subject addr(acc3) to grant > TRUE, you are granting that verifier to view ur certs
- check if verifier(acc4) have access getCertListVerifiers(acc2) > uint256[]: 1,3,5
  - [ ] TEST: check if verifier(acc5) have access getCertListVerifiers(acc2) > no viewing access for the subject certificates

## Deny Acess

### Description
Student>Verifier, Deny access
### Test Case:
1. Test Authorized users with valid roles can use specifc functions. 
2. Test if only subject can deny access to only verifiers and not issuers.
3. Test if verifier can still view certs even after deny.

### prerequisite:

1. acc2 have certs issued(certid: 1,3,5) by issuer after revoking one
2. acc2 have given access to acc4

- Using acc2, deny verifier (acc4)
  - [ ] TEST: using another random addr(acc3) to deny > FALSE, only authorised roles
  - [ ] TEST: using another subject addr(acc3) to deny > TRUE, no viewing access for the subject certificates
- check if verifier(acc4) have access getCertListVerifiers(acc4) > no viewing access for the subject certificates
