var CryptoQuizToken = artifacts.require('./CryptoQuizToken.sol');
var CryptoQuizTokenSale = artifacts.require('./CryptoQuizTokenSale.sol');

// contract('Temp', function(accounts) {
//   var tokenInstance;
//   var tokenSaleInstance;
//   var admin = accounts[0];
//   console.log('admin: ', admin);
//   var buyer = accounts[1];
//   console.log('buyer: ', buyer);

//   it('ends token sale', function() {
//     return CryptoQuizToken.deployed().then(function(instance) {
//       tokenInstance = instance;
//       return CryptoQuizTokenSale.deployed();
//     })
//     .then(function(instance) {
//       tokenSaleInstance = instance;
//       return tokenInstance.balanceOf(tokenSaleInstance.address);
//     })
//     .then(function(balance) {
//       console.log('balanceOf(tokenSale) = ', balance.toString());
//       return tokenInstance.balanceOf(admin);
//     })
//     .then(function(balance) {
//       console.log('balanceOf(admin) = ', balance.toString());
//       return tokenInstance.transfer(admin, 500);
//     })
//     .then(function(receipt) {
//       console.log('transfer 500 to admin.', receipt);
//       return tokenInstance.transfer(tokenSaleInstance.address, 500, { from: admin });
//     })
//     .then(function(receipt) {
//       console.log('transfer 500 to tokenSale.', receipt);
//       // return tokenInstance.transfer(tokenSaleInstance.address, 500, { from: admin });
//     })
//   });
// });
