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
        // .then(function (question) {
        var questionList = $("#questions-list");
        var questionId = web3.toUtf8(question[0]);
        var questionStr = question[1];
        var questionPk = question[2];
        var questionTemplate = ' <tr><td style="overflow-wrap: break-word;">'+questionStr+'</td></tr>';
        var questionBoxTemplate = '<div class="row"><div class="col-lg-12"><div class="panel panel-success"><div class="panel-heading">'+'Question '+questionId+'</div><div class="panel-body" style="overflow-wrap: break-word;">'+questionStr+'</div><div class="panel-footer"><div class="input-group"><input type="text" class="form-control" id="new-answer-'+questionId+'" placeholder="Your Answer"><span class="input-group-btn"><button class="btn btn-default" type="button" onclick="App.submitAnswer('+i+')">Submit</button></span></div></div></div></div></div>';
        questionList.append(questionBoxTemplate);
        App.questions.push(question);
        // });
      }


      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  // Submit answer
  submitAnswer: async function(questionIndex)
  {
    var question = App.questions[questionIndex];
    var questionId = web3.toUtf8(question[0]);
    var newAnswer = $("#new-answer-"+questionId);
    var answerStr = newAnswer.val();

    /* Encrypt Answer */
    var randomNumber = parseInt((Math.random() * 100), 10).toString();
    var finalAnswer = answerStr+"//"+randomNumber;
    var publicKey = question[2];
    console.log(finalAnswer);

    const encrypted = await eccrypto.enrypt(publicKey, Buffer.from(finalAnswer));
    const encryptedJSONString = Json.stringify(encrypted);


    // // <TEMP>
    // var privateKeyA = eccrypto.generatePrivate();
    // publicKey = eccrypto.getPublic(privateKeyA);
    // console.log('privateKeyA', web3.fromAscii(privateKeyA.toString()));
    // console.log('privateKeyA', privateKeyA);
    // console.log('publicKey', publicKey.toString());
    // // </TEMP>

    // // Encrypt
    // const encrypted = await eccrypto.encrypt(publicKey, Buffer.from(finalAnswer));
    // console.log('encrypted', encrypted);
    // const encryptedJSONString = JSON.stringify(encrypted);
    // console.log('encryptedJSONString', encryptedJSONString);

    // // Decrypt
    // const encryptedRecovered = JSON.parse(encryptedJSONString);
    // encryptedRecovered.ciphertext = Buffer.from(encryptedRecovered.ciphertext);
    // encryptedRecovered.ephemPublicKey = Buffer.from(encryptedRecovered.ephemPublicKey);
    // encryptedRecovered.iv = Buffer.from(encryptedRecovered.iv);
    // encryptedRecovered.mac = Buffer.from(encryptedRecovered.mac);
    // console.log('encryptedRecovered', encryptedRecovered);
    // const decrypted = await eccrypto.decrypt(privateKeyA, encryptedRecovered);
    // console.log('decrypted', decrypted);
    // const decryptedRecovered = decrypted.toString();
    // console.log('decryptedRecovered', decryptedRecovered);
    // return;

    // QuestionId == questionIndex in our example

    App.contracts.CryptoQuiz.deployed().then(function(instance) {
      .then(result => {
        instance.submitAnswer(questionId,questionIndex,encryptedJSONString);
        console.log(result);
      })
      .catch(err => {
        console.warn(err);
      })
    });
  }

  

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
