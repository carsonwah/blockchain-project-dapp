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
          $("#account-address").html("Hi, Professor. Your Account is: " + account);
        }
      });
  
      // Check if user is professor
      App.contracts.CryptoQuiz.deployed().then(function(instance) {
        CryptoQuizInstance = instance;
        return CryptoQuizInstance.professor();
      }).then(function(professor) {
        if (professor != App.account) {
            alert("You are not professor!");
            window.location.href = 'index.html';
        }
        return CryptoQuizInstance.questionsCount();
      }).then(function(questionsCount) {
        
        for(var i = 0; i <= questionsCount; i++) {
          CryptoQuizInstance.questions(i).then(function(question) {
            var questionList = $("#questions-list");
            var questionId = question[0];
            var questionStr = question[1];
            var publicKey = question[2];
            console.log("publicKey: " + publicKey);
            var questionTemplate = '<tr><td style="overflow: scroll;">'+questionId+'</td><td style="overflow-wrap: break-word;">'+questionStr+'</td><td><button class="btn btn-success" type="button" onclick="App.revealAnswer()">Reveal Answer</button></td></tr>';
            questionList.append(questionTemplate);
          });
        }
        loader.hide();
        content.show();
      }).catch(function(error) {
        console.warn(error);
      });
    },

    addStudent: function() {
      var studentAddr = $("#student-addr");
      var studentList = $("#student-list");
      // Add student
      App.contracts.CryptoQuiz.deployed().then(function(instance) {
        CryptoQuizInstance = instance;
        return CryptoQuizInstance.addStudent(studentAddr.val());
      }).then(function(result) {
        var studentTemplate = '<li class="list-group-item">'+studentAddr.val()+'</li>';
        studentList.append(studentTemplate);
        studentAddr.val('');
        console.log("New Student Added");
      }).catch(function(error) {
        console.warn("addStudent(): " + error);
      });
    },

    postQuestion: function() {
      var newQuestion = $("#new-question");
      var questionList = $("#questions-list");

      var questionId = "1";
      var questionStr = newQuestion.val();
      var publicKey = "abcde";

      // Post new question
      App.contracts.CryptoQuiz.deployed().then(function(instance) {
        CryptoQuizInstance = instance;
        return CryptoQuizInstance.postQuestion(questionId, questionStr, publicKey);
      }).then(function(result) {
        var questionTemplate = '<tr><td style="overflow: scroll;">'+questionId+'</td><td style="overflow-wrap: break-word;">'+questionStr+'</td><td><button class="btn btn-success" type="button" onclick="App.revealAnswer()">Reveal Answer</button></td></tr>';
        questionList.append(questionTemplate);
        newQuestion.val('');
        console.log("New Question Posted");
      }).catch(function(error) {
        console.warn("postQuestion(): " + error);
      });
    },

    revealAnswer: function() {
      console.log("revealAnswer()");
    }
  };
  
  $(function() {
    $(window).load(function() {
      App.init();
    });
  });
  