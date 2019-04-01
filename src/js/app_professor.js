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
      }).then(async function(questionsCount) {
        /**
         * GET all questions from the chain 
         */
        App.nextQuestionId = questionsCount.toNumber();
        for(let i = 0; i < questionsCount; i++) {
          const question = await CryptoQuizInstance.questions(i)
          let questionList = $("#questions-list");
          let questionStr = question[1];
          let revealed = question[6];
          let questionTemplate = '<tr><td style="overflow: scroll;">'+i+'</td><td style="overflow-wrap: break-word;">'+questionStr+'</td><td>'
          let revealBtn = '<button class="btn btn-success" type="button" data-toggle="modal" data-target="#reveal-answer-modal" data-id="'+i+'">Reveal Answer</button></td></tr>';
          let detailsBtn = '<button class="btn btn-warning" type="button" data-toggle="modal" data-target="#details-modal" data-id="'+i+'">Details</button></td></tr>';
          if (revealed) {
            questionTemplate += detailsBtn;
          } else {
            questionTemplate += revealBtn;
          }
          questionList.append(questionTemplate);
        }
        loader.hide();
        content.show();
      }).catch(function(error) {
        console.warn(error);
      });
    },

    addStudent: function() {
      var studentAddr = $("#student-addr");
      var alert = $("#alert-student");
      // Add student
      App.contracts.CryptoQuiz.deployed().then(function(instance) {
        CryptoQuizInstance = instance;
        return CryptoQuizInstance.addStudent(studentAddr.val());
      }).then(function(result) {
        var addStudentAlert = '<div class="alert alert-success alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Success!</strong> '+studentAddr.val()+' Added</div>'
        alert.append(addStudentAlert);
        studentAddr.val('');
        console.log("New Student Added");
      }).catch(function(error) {
        console.warn("addStudent(): " + error);
      });
    },

    postQuestion: function() {
      var newQuestion = $("#new-question");
      var questionList = $("#questions-list");
      var alert = $("#alert-question");
      var questionId = web3.fromDecimal(App.nextQuestionId);
      var questionStr = newQuestion.val();

      var privateKey = eccrypto.generatePrivate();
      var publicKey = eccrypto.getPublic(privateKey);
      var publicKey = publicKey.toString('base64');

      // Post new question
      App.contracts.CryptoQuiz.deployed().then(function(instance) {
        CryptoQuizInstance = instance;
        console.log(questionId, questionStr, publicKey);
        return CryptoQuizInstance.postQuestion(questionId, questionStr, publicKey);
      }).then(function(result) {
        var newQuestionId = web3.toDecimal(questionId);
        App.nextQuestionId++;
        var questionTemplate = '<tr><td style="overflow: scroll;">'+newQuestionId+'</td><td style="overflow-wrap: break-word;">'+questionStr+'</td><td><button class="btn btn-success" type="button" data-toggle="modal" data-target="#reveal-answer-modal" data-id="'+newQuestionId+'">Reveal Answer</button></td></tr>';
        questionList.append(questionTemplate);
        var addQuestionAlert = '<div class="alert alert-success alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Success!</strong> Please SAVE your Private Key for Question ID '+newQuestionId+' : '+web3.fromAscii(privateKey.toString())+'</div>'
        alert.append(addQuestionAlert);
        newQuestion.val('');
        console.log("New Question Posted");
      }).catch(function(error) {
        console.warn("postQuestion(): " + error);
      });
    },

    revealAnswer: function(questionIndex, privateKey, answer) {
      // Reveal Answer
      App.contracts.CryptoQuiz.deployed().then(function(instance) {
        CryptoQuizInstance = instance;
        var questionId = web3.fromDecimal(questionIndex);
        // In this example we make the questionId == questionIndex
        return CryptoQuizInstance.revealAnswer(questionId, questionIndex, privateKey, answer);
      }).then(function(result) {
        location.reload();
      }).catch(function(error) {
        console.log(error);
      })
    },

    distributePt: function(questionIndex) {
      // Distribute Points
      console.log('distributePt()');
      App.contracts.CryptoQuiz.deployed().then(function(instance) {
        CryptoQuizInstance = instance;
        return CryptoQuizInstance.questions(questionIndex);
      }).then(function(question) {
        console.log(question);
        console.log(question[2]);
      });
    },

    loadQuestionById: function(questionIndex) {
      App.contracts.CryptoQuiz.deployed().then(function(instance) {
        CryptoQuizInstance = instance;
        return CryptoQuizInstance.questions(questionIndex);
      }).then(function(question) {
        let modal = $('#details-modal');
        modal.find('#modal-private-key').val(question[4]);
        modal.find('#modal-answer').val(question[5]);
        modal.find('#numAns').html("Number of Answer: "+question[2].toNumber());
        // Check points distributed
        if (!question[7]) {
          let btnGroup = modal.find('#btn-group');
          let closeBtn = '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>';
          let distributePtBtn = '<button type="button" class="btn btn-warning" id="btn-distribute">Distribute Points</button>';
          btnGroup.empty();
          btnGroup.append(closeBtn+distributePtBtn);
          modal.find('#btn-distribute').click(function() {
            App.distributePt(questionIndex);
          })
        }
      }).catch(function(error) {
        console.log(error);
      });
    }
  };
  
  $(function() {
    $(window).load(function() {
      App.init();

      // Reveal Answer Modal OnShow Handler
      // https://getbootstrap.com/docs/3.3/javascript/#modals-related-target
      $('#reveal-answer-modal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget); // Button that triggered the modal
        var questionIndex = button.data('id'); // Extract info from data-* attributes
        var modal = $(this);
        modal.find('#btn-submit').click(function() {
          var privateKey = modal.find('#modal-private-key').val();
          var answer = modal.find('#modal-answer').val();
          App.revealAnswer(questionIndex, privateKey, answer);
        })
      });

      // Deatils Modal OnShow Handler
      // https://getbootstrap.com/docs/3.3/javascript/#modals-related-target
      $('#details-modal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget); // Button that triggered the modal
        var questionIndex = button.data('id'); // Extract info from data-* attributes
        App.loadQuestionById(questionIndex);
      });
    });
  });
  