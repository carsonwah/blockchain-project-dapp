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
    $.getJSON("CryptoQuizTokenSale.json", function(CryptoQuizTokenSale) {
      App.contracts.CryptoQuizTokenSale = TruffleContract(CryptoQuizTokenSale);
      App.contracts.CryptoQuizTokenSale.setProvider(App.web3Provider);
      App.contracts.CryptoQuizTokenSale.deployed().then(function(CryptoQuizTokenSale) {
        console.log("Token Sale Address:", CryptoQuizTokenSale.address);
      });
    }).done(function() {
      $.getJSON("CryptoQuizToken.json", function(cryptoQuizToken) {
        App.contracts.CryptoQuizToken = TruffleContract(cryptoQuizToken);
        App.contracts.CryptoQuizToken.setProvider(App.web3Provider);
        App.contracts.CryptoQuizToken.deployed().then(function(cryptoQuizToken) {
          console.log("Token Address:", cryptoQuizToken.address);
        });

        App.listenForEvents();
        return App.render();
      });
    })
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.CryptoQuizTokenSale.deployed().then(function(instance) {
      instance.Sell({}, {
        fromBlock: 0,
        toBlock: 'latest',
      }).watch(function(error, event) {
        console.log("event triggered", event);
        App.render();
      })
    })
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

    // Load token sale contract
    App.contracts.CryptoQuizTokenSale.deployed().then(function(instance) {
      CryptoQuizTokenSaleInstance = instance;
      return CryptoQuizTokenSaleInstance.tokenPrice();
    }).then(function(tokenPrice) {
      App.tokenPrice = tokenPrice;
      $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
      return CryptoQuizTokenSaleInstance.tokensSold();
    }).then(function(tokensSold) {
      App.tokensSold = tokensSold.toNumber();
      $('.tokens-sold').html(App.tokensSold);
      $('.tokens-available').html(App.tokensAvailable);

      var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
      $('#progress').css('width', progressPercent + '%');

      // Load token contract
      App.contracts.CryptoQuizToken.deployed().then(function(instance) {
        // instance.balanceOf(['0x3F710E45FC7EF603E3301CD6E3350F925026f64B']).then((result) => console.log(result.toNumber()));
        cryptoQuizTokenInstance = instance;
        return cryptoQuizTokenInstance.balanceOf(App.account);
      }).then(function(balance) {
        $('.dapp-balance').html(balance.toNumber());
        App.loading = false;
        loader.hide();
        content.show();
      })
    });
  },

  buyTokens: function() {
    $('#content').hide();
    $('#loader').show();
    var numberOfTokens = $('#numberOfTokens').val();
    console.log('numberOfTokens', numberOfTokens);
    // var ethValue = web3.utils.toWei(parseInt(numberOfTokens)*0.01);
    var ethValue = numberOfTokens * App.tokenPrice;
    console.log('msg.value', ethValue);
    App.contracts.CryptoQuizTokenSale.deployed().then(function(instance) {
      return instance.buyTokens(numberOfTokens, {
        from: App.account,
        value: ethValue.toString(),
        gas: 500000 // Gas limit
      });
    }).then(function(result) {
      console.log("Tokens bought...", result);
      $('form').trigger('reset') // reset number of tokens in form
      // Wait for Sell event
    }).catch(function(err) {
      console.log('buyTokens() failed', err);
      $('#content').show();
      $('#loader').hide();
    })
  }
}

$(function() {
  $(window).load(function() {
    App.init();
  })
});
