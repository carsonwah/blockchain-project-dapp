var CryptoQuiz = artifacts.require("./CryptoQuiz.sol");
var CryptoQuizToken = artifacts.require("./CryptoQuizToken.sol");
var CryptoQuizTokenSale = artifacts.require("./CryptoQuizTokenSale.sol");

module.exports = async function(deployer, network, accounts) {
  const tokensSupply = 1000000;
  const tokenForSale = 500000;
  const tokenForQuiz = 250000;
  const tokenPrice = 1e16.toString();  // 0.01 ether
  const deployAccountAddress = accounts[0];

  await deployer.deploy(CryptoQuizToken, tokensSupply);
  await deployer.deploy(CryptoQuiz, CryptoQuizToken.address);
  await deployer.deploy(CryptoQuizTokenSale, CryptoQuizToken.address, tokenPrice)
  const tokenContract = await CryptoQuizToken.deployed()
  console.log(`Sending ${tokenForSale} from ${deployAccountAddress}(owner) to ${CryptoQuizTokenSale.address}(tokenSale)`);
  const result1 = await tokenContract.transfer(CryptoQuizTokenSale.address, tokenForSale, { from: deployAccountAddress });
  console.log('SUCCESS');
  // console.log(result1);
  console.log(`Sending ${tokenForQuiz} from ${deployAccountAddress}(owner) to ${CryptoQuiz.address}(CryptoQuiz)`);
  const result2 = await tokenContract.transfer(CryptoQuiz.address, tokenForQuiz, { from: deployAccountAddress });
  console.log('SUCCESS');
  // console.log(result2);
  console.log('Finished deployment.')
};