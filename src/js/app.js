App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
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
    $.getJSON("CryptoQuiz.json", function(quiz) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(quiz);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);
      return;
    });
  },

  loadAccountInfo: function() {
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });
  },

  loadQuiz: function() {

  },

  answerQuiz: function() {

  },

  releaseAnswer: function() {

  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
