// Reference: https://github.com/dappuniversity/token_sale
App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 500000,

  init: function() {
    console.log("App initialized...")
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },

  initContracts: function() {
    $.getJSON("CryptoQuizToken.json", function(cryptoQuizToken) {
      App.contracts.CryptoQuizToken = TruffleContract(cryptoQuizToken);
      App.contracts.CryptoQuizToken.setProvider(App.web3Provider);
      App.contracts.CryptoQuizToken.deployed().then(function(cryptoQuizToken) {
        console.log("Token Address:", cryptoQuizToken.address);
      });

      return App.render();
    });
  },

  render: function() {
    if (App.loading) {
      return;
    }
    App.loading = true;

    var loader  = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        $('#accountAddress').html("Your Account: " + account);
      }
    })
    // Load token contract
    App.contracts.CryptoQuizToken.deployed().then(function(instance) {
      cryptoQuizTokenInstance = instance;
      return cryptoQuizTokenInstance.balanceOf(App.account);
    }).then(function(balance) {
      $('.dapp-balance').html(balance.toNumber());
      App.loading = false;
      loader.hide();
      content.show();
    })
  },

  transferTokens: function() {
    $('#content').hide();
    $('#loader').show();

    var toAddress = $('#toAddress').val();
    var numberOfTokens = $('#numberOfTokens').val();

    App.contracts.CryptoQuizToken.deployed().then(function(instance) {
      return instance.transfer(toAddress, numberOfTokens, {
        from: App.account,
        gas: 500000 // Gas limit
      });
    })
    .then(function(result) {
      console.log("Tokens transferred...", result);
      $('form').trigger('reset') // reset number of tokens in form
      // Refresh after 2s
      setTimeout(() => {
        App.render();
      }, 2000);
    })
    .catch(function(err) {
      console.log('buyTokens() failed', err);
      $('#content').show();
      $('#loader').hide();
    });

  }
}

$(function() {
  $(window).load(function() {
    App.init();
  })
});
