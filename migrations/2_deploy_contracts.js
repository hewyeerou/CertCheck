var SimpleStorage = artifacts.require("./SimpleStorage.sol");

// to be replaced during development
module.exports = function(deployer) {
  deployer.deploy(SimpleStorage);
};
