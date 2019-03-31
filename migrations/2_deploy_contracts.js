var CryptoQuiz = artifacts.require("./CryptoQuiz.sol");
var CryptoQuizToken = artifacts.require("./CryptoQuizToken.sol");
var CryptoQuizTokenSale = artifacts.require("./CryptoQuizTokenSale.sol");

module.exports = async function(deployer, network, accounts) {
  const tokensSupply = 1000000;
  const tokenForSale = 500000;
  // const tokenPrice = 1000000000000000;
  const tokenPrice = 1e16.toString();  // 0.01 ether
  // const tokenPrice = 1;  // 0.01 eth
  const deployAccountAddress = accounts[0];

  // deployer.deploy(CryptoQuizToken, tokensSupply).then(function() {
  //   console.log('CryptoQuizToken.address: ', CryptoQuizToken.address);

  //   return deployer.deploy(CryptoQuiz, CryptoQuizToken.address)
  //     .then(function() {
  //       console.log('CryptoQuiz.address: ', CryptoQuiz.address);

  //       // Token price is 0.001 Ether
  //       var tokenPrice = 1000000000000000;
  //       return deployer.deploy(CryptoQuizTokenSale, CryptoQuizToken.address, tokenPrice)
  //         .then(function() {
  //           console.log('CryptoQuizTokenSale.address: ', CryptoQuizTokenSale.address);

  //           // Transfer initial token supply
  //           CryptoQuizToken.deployed()
  //             .then(function(instance) {
  //               instance.transfer(CryptoQuizTokenSale.address, tokenForSale, { from: deployAccountAddress });
  //             });
  //         });
  //     });

  // });

  await deployer.deploy(CryptoQuizToken, tokensSupply);
  await deployer.deploy(CryptoQuiz, CryptoQuizToken.address);
  await deployer.deploy(CryptoQuizTokenSale, CryptoQuizToken.address, tokenPrice)
  // .then(() => {
  CryptoQuizToken.deployed()
  .then(function(instance) {
    console.log(`Sending ${tokenForSale} from ${deployAccountAddress}(owner) to ${CryptoQuizTokenSale.address}(tokenSale)`);
    instance.transfer(CryptoQuizTokenSale.address, tokenForSale, { from: deployAccountAddress })
      .then((result) => {
        console.log('Success', result);
      })
      .catch(err => {
        console.log('Failed', err);
      })
  });
  // });
};
