var CryptoQuiz = artifacts.require("./CryptoQuiz.sol");
var CryptoQuizToken = artifacts.require("./CryptoQuizToken.sol");
var CryptoQuizTokenSale = artifacts.require("./CryptoQuizTokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(CryptoQuizToken, 1000000).then(function() {
    // Token price is 0.001 Ether
    var tokenPrice = 1000000000000000;
    deployer.deploy(CryptoQuiz, CryptoQuizToken.address);
    return deployer.deploy(CryptoQuizTokenSale, CryptoQuizToken.address, tokenPrice);
  });
};
