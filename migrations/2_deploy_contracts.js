var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var CertificateNetwork = artifacts.require("./CertificateNetwork.sol");
var Certificate = artifacts.require("./Certificate.sol");

// to be replaced during development
module.exports = function(deployer, network, accounts) {
  deployer.deploy(SimpleStorage, { from: accounts[0] })
  .then(() => SimpleStorage.deployed())
  .then(() => deployer.deploy(CertificateNetwork, accounts[1], { from: accounts[0] }))
  .then(() => CertificateNetwork.deployed())
  .then(() => console.log("certificate network address", CertificateNetwork.address))
  .then(() => deployer.deploy(Certificate, CertificateNetwork.address))
  .then(() => Certificate.deployed())
};
