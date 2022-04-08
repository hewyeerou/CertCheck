var SimpleStorage = artifacts.require("./SimpleStorage.sol");
const CertificateNetwork = artifacts.require("CertificateNetwork");
const CertificateStore = artifacts.require("CertificateStore");
const Certificate = artifacts.require("Certificate");


module.exports = function(deployer, network, accounts) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(CertificateNetwork).then(function() {
    return deployer.deploy(CertificateStore, CertificateNetwork.address);
  }).then(function() {
    return deployer.deploy(Certificate, CertificateNetwork.address, CertificateStore.address);
  });
};
