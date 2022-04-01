var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var CertificateNetwork = artifacts.require("./CertificateNetwork.sol");
var Certificate = artifacts.require("./Certificate.sol");

// to be replaced during development
module.exports = function(deployer, network, accounts) {
  deployer.deploy(SimpleStorage, { from: accounts[0] })
  .then(() => SimpleStorage.deployed())
  .then(() => deployer.deploy(CertificateNetwork, { from: accounts[0] }))
  .then(() => CertificateNetwork.deployed())
  // .then(() => deployer.deploy(Certificate, Users.address, { from: accounts[1] }))
  // .then(() => Certificate.deployed())
};