App = {
  web3Provider: null,
  contracts: {},
  questions: [],

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

    // Load Questions
    App.contracts.CryptoQuiz.deployed().then(function(instance) {
      CryptoQuizInstance = instance;
      return CryptoQuizInstance.questionsCount();
    }).then(async function(questionsCount) {
      var questionsTable = $("#questionsTable");
      if (questionsCount <= 0) {
        questionsTable.html("No questions yet!");
      }
      for (let i = 0;  i< questionsCount; i++) 
      {
        const question = await CryptoQuizInstance.questions(i);
        var questionList = $("#questions-list");
        var questionStr = question[1];
        var questionPk = question[2];
        var questionRevealed = question[6];
        if (questionRevealed == true)
        {
          var correctAnswer = question[5];
          var questionBoxTemplate = '<div class="row"><div class="col-lg-12"><div class="panel panel-success"><div class="panel-heading">'+'Question '+i+'</div><div class="panel-body" style="overflow-wrap: break-word;">'+questionStr+'</div><div class="panel-footer"><input type="text" class="form-control" id="modal-answer" placeholder='+correctAnswer+' readonly="readonly"></span></div></div></div></div></div>';
          questionList.append(questionBoxTemplate);
          App.questions.push(question);
        }
        else
        {
          var questionTemplate = ' <tr><td style="overflow-wrap: break-word;">'+questionStr+'</td></tr>';
          var questionBoxTemplate = '<div class="row"><div class="col-lg-12"><div class="panel panel-success"><div class="panel-heading">'+'Question '+i+'</div><div class="panel-body" style="overflow-wrap: break-word;">'+questionStr+'</div><div class="panel-footer"><div class="input-group"><input type="text" class="form-control" id="new-answer-'+i+'" placeholder="Your Answer"><span class="input-group-btn"><button class="btn btn-default" type="button" onclick="App.submitAnswer('+i+')">Submit</button></span></div></div></div></div></div>';
          questionList.append(questionBoxTemplate);
          App.questions.push(question);
        }
      }

      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  // Submit answer
  submitAnswer: async function(questionIndex) {
      var question = App.questions[questionIndex];
      var questionId = questionIndex;
      var newAnswer = $("#new-answer-"+questionIndex);
      var answerStr = newAnswer.val();
      var CryptoQuizInstance;

      /* Encrypt Answer */
      var randomNumber = parseInt((Math.random() * 100), 10).toString();
      var finalAnswer = answerStr+"//"+randomNumber;
      console.log("question: "+ question);
      var publicKey = Buffer.from(question[3], 'base64');
      console.log(publicKey);
      console.log(finalAnswer);
      console.log("public key: "+publicKey);

      const encrypted = await eccrypto.encrypt(publicKey, Buffer.from(finalAnswer));
      const encryptedJSONString = JSON.stringify(encrypted);

      App.contracts.CryptoQuiz.deployed().then(function(instance) {
        CryptoQuizInstance = instance;
        CryptoQuizInstance.submitAnswer(questionId,questionIndex,encryptedJSONString);
      }).then(result => {
          console.log(result);
        })
        .catch(err => {
          console.warn(err);
        });
    },
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
