pragma solidity ^0.5.0;

contract CryptoQuiz {

    struct Student {
        bool exist;
        uint16 points;
    }

    struct Question {
        bytes32 questionId;  // To prevent problems from partial order of the array
        string question;  // Question itself
        Answer[] answers;  // Received answers
        mapping(address => bool) answeredStudents;
        bytes32 publicKey;  // 256-bit ECDSA key, For encrypting answer
        // uint32 deadline;  // Deadline. (Should be large enough because it is compared with block.timestamp)
        bool revealed;  // Answer revealed or not
        bytes32 privateKey;  // Not exist until revealed
        bytes32 trueAnswer;  // Not exist until revealed
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
    Question[] public questions;

    event QuestionRevealed(uint questionIndex, string answer);

    constructor() public {
        professor = msg.sender;
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

    function postQuestion(bytes32 _questionId, string memory _question, bytes32 _publicKey) public onlyProfessor {
        Question memory question = Question(
            _questionId,
            _question,
            new Answer[](0),
            _publicKey,
            false,
            "",
            "",
            false
            );
        questions.push(question);
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
        question.answers.push(Answer(msg.sender, _hashedAnswer));

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
        decryptedAnswers: professor should decrypt answers offline and submit them here
     */
    function distributePoints(bytes32 _questionId, uint _questionIndex, bytes32[] memory decryptedAnswers) public onlyProfessor {
        Question storage question = questions[_questionIndex];
        require(question.questionId == _questionId, "Different question.");
        require(question.revealed, "Answer not yet revealed.");
        require(!question.pointsDistributed, "Points already distributed.");
        require(decryptedAnswers.length == question.answers.length, "Invalid decryptedAnswers.");

        // Send reward to students
        for (uint i = 0; i<question.answers.length; i++) {
            if (decryptedAnswers[i] == question.trueAnswer) {
                // Answered correctly
                address studentAddress = question.answers[i].byStudent;
                students[studentAddress].points += 1;
            }
        }
    }

}
