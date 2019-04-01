pragma solidity >=0.4.22 <0.6.0;

import "./CryptoQuizToken.sol";

contract CryptoQuiz {

    struct Student {
        bool exist;
    }

    struct Question {
        // Question details
        bytes32 questionId;  // For checking. (To prevent problems from partial order of the array)
        string questionStr;  // Question itself

        // Received answers
        uint answersCount;
        mapping(uint => Answer) answers;
        mapping(address => bool) answeredStudents;

        // Secrets of answer
        string publicKey;  // ECIES key (Reference: secp256k1), For encrypting answer
        // uint32 deadline;  // Deadline. (Should be large enough because it is compared with block.timestamp)
        string privateKey;  // Not exist until revealed
        string trueAnswer;  // Not exist until revealed

        // Status of the question
        bool revealed;  // Answer revealed or not
        bool pointsDistributed;  // Whether points have been distributed to students or not
    }

    struct Answer {
        address byStudent;
        string encryptedAnswer;  // Encrypted with Question.publicKey + nonce
    }

    CryptoQuizToken tokenContract;

    // Professor
    address public professor;

    // Students
    // uint public studentsCount;
    mapping(address => Student) public students;

    // Questions list
    uint public questionsCount;
    mapping(uint => Question) public questions;

    event QuestionRevealed(uint questionIndex, string answer);

    constructor(address _tokenContract) public {
        professor = msg.sender;
        questionsCount = 0;
        tokenContract = CryptoQuizToken(_tokenContract);
    }

    modifier onlyProfessor {
        require(msg.sender == professor, "For professor only.");
        _;
    }

    modifier onlyStudent {
        require(students[msg.sender].exist, "For student only.");
        _;
    }

    function addStudent(address _studentAddress) public onlyProfessor {
        students[_studentAddress] = Student(true);
    }

    function postQuestion(bytes32 _questionId, string memory _questionStr, string memory _publicKey) public onlyProfessor {
        Question memory question = Question({
            questionId: _questionId,
            questionStr: _questionStr,
            answersCount: 0,
            publicKey: _publicKey,
            revealed: false,
            privateKey: "",
            trueAnswer: "",
            pointsDistributed: false
        });
        questions[questionsCount] = question;
        questionsCount++;
    }

    /**
        hashedAnswer: Answer should be hashed with question.publicKey
     */
    function submitAnswer(bytes32 _questionId, uint _questionIndex, string memory _hashedAnswer) public onlyStudent {
        Question storage question = questions[_questionIndex];
        require(question.questionId == _questionId, "Different question.");
        require(!question.revealed, "Answer already revealed.");
        require(!question.answeredStudents[msg.sender], "This student already answered this question.");

        // Add answer to question
        question.answers[question.answersCount] = Answer(msg.sender, _hashedAnswer);
        question.answersCount++;

        // Indicate already answered
        question.answeredStudents[msg.sender] = true;
    }

    /**
        getAnswerForQuestion: Retrieve an answer in a question
        (Because mappings in struct are not retrievable)
     */
    function getAnswerForQuestion(uint _questionIndex, uint _answerIndex) public view returns (address, string memory) {
        return (questions[_questionIndex].answers[_answerIndex].byStudent, questions[_questionIndex].answers[_answerIndex].encryptedAnswer);
    }

    function revealAnswer(bytes32 _questionId, uint _questionIndex, string memory _privateKey, string memory _trueAnswer) public onlyProfessor {
        Question storage question = questions[_questionIndex];
        require(question.questionId == _questionId, "Different question.");
        require(!question.revealed, "Answer already revealed.");

        // Set question to be revealed
        question.revealed = true;
        question.privateKey = _privateKey;
        question.trueAnswer = _trueAnswer;
    }

    /**
        decryptedAnswers: professor should decrypt answers from students offline, and submit them here
        (Because it's too expensive to be computed on-chain)
        @param answerJudgements bool[]: each student answered correctly or not
     */
    function distributePoints(bytes32 _questionId, uint _questionIndex, bool[] memory answerJudgements) public onlyProfessor {
        Question storage question = questions[_questionIndex];

        require(question.questionId == _questionId, "Different question.");
        require(question.revealed, "Answer not yet revealed.");
        require(!question.pointsDistributed, "Points already distributed.");
        require(answerJudgements.length == question.answersCount, "Invalid answerJudgements.");

        // Send reward to students
        for (uint i = 0; i<question.answersCount; i++) {
            if (answerJudgements[i]) {
                // Answered correctly
                // Get ethereum address of students
                address studentAddress = question.answers[i].byStudent;

                // Send token from prof address to student address
                tokenContract.transfer(studentAddress, 1);
            }
        }
    }

}
