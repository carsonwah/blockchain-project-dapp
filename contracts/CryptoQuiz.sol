pragma solidity ^0.5.6;

contract CryptoQuiz {

    struct Student {
        bool exist;
        uint16 points;
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
        bytes32 publicKey;  // 256-bit ECIES key (secp256k1), For encrypting answer
        // uint32 deadline;  // Deadline. (Should be large enough because it is compared with block.timestamp)
        bytes32 privateKey;  // Not exist until revealed
        bytes32 trueAnswer;  // Not exist until revealed

        // Status of the question
        bool revealed;  // Answer revealed or not
        bool pointsDistributed;  // Whether points have been distributed to students or not
    }

    struct Answer {
        address byStudent;
        string hashedAnswers;  // Encrypted with Question.publicKey + nonce
    }

    // Professor
    address public professor;

    // Students
    // uint public studentsCount;
    mapping(address => Student) public students;

    // Questions list
    uint questionsCount;
    mapping(uint => Question) public questions;

    event QuestionRevealed(uint questionIndex, string answer);

    constructor() public {
        professor = msg.sender;
        questionsCount = 0;
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
        students[_studentAddress] = Student(true, 0);
    }

    function postQuestion(bytes32 _questionId, string memory _questionStr, bytes32 _publicKey) public onlyProfessor {
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

    function revealAnswer(bytes32 _questionId, uint _questionIndex, bytes32 _privateKey, bytes32 _trueAnswer) public onlyProfessor {
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
     */
    function distributePoints(bytes32 _questionId, uint _questionIndex, bytes32[] memory decryptedAnswers) public onlyProfessor {
        Question storage question = questions[_questionIndex];
        require(question.questionId == _questionId, "Different question.");
        require(question.revealed, "Answer not yet revealed.");
        require(!question.pointsDistributed, "Points already distributed.");
        require(decryptedAnswers.length == question.answersCount, "Invalid decryptedAnswers.");

        // Send reward to students
        for (uint i = 0; i<question.answersCount; i++) {
            if (decryptedAnswers[i] == question.trueAnswer) {
                // Answered correctly
                address studentAddress = question.answers[i].byStudent;
                students[studentAddress].points += 1;
            }
        }
    }

}
