//var TRXMessages = artifacts.require("./TRXMessages.sol");
var TRXChain = artifacts.require("./TRXChain.sol");

module.exports = function (deployer) {
  // deployer.deploy(TRXMessages);
  deployer.deploy(TRXChain, "TQ9nCgHVgki3KjXUnC5Vdm3bcuNTQ4EVMY");
};
