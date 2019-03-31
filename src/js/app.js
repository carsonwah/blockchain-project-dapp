App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    console.log("App initalization");
    return await App.initWeb3();
  },

  initWeb3: async function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // if no web3 instance provided add a new one from Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("CryptoQuiz.json", function(CryptoQuiz) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.CryptoQuiz = TruffleContract(CryptoQuiz);
      // Connect provider to interact with contract
      App.contracts.CryptoQuiz.setProvider(App.web3Provider);
      return App.render();
    });
  },

  render: function() {
    var CryptoQuizInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.CryptoQuiz.deployed().then(function(instance) {
      CryptoQuizInstance = instance;
      return CryptoQuizInstance.candidatesCount();
    }).then(function(candidatesCount) {



      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  }


  

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
