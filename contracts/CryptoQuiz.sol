pragma solidity ^0.5.0;

contract CryptoQuiz {

    struct Question {
        string question;  // Question itself
        bytes32[] answers;  // Received answers
        address[] answeredStudents;
        bytes32 pubKey;  // Used to encrypt answer
        bool revealed;  // Answer revealed or not
        bytes32 trueAnswer;
    }

    struct Student {
        uint8 points;
    }

    // Professor
    address public professor;

    // Students
    uint public studentsCount;
    mapping(address => Student) public students;

    // Questions list
    Question[] public questions;

    event QuestionRevealed(uint8 questionIndex, string answer);

    constructor() public {
        professor = msg.sender;
    }

    function postQuestion(string memory question) public {
        require(msg.sender == professor, "Sender not authorized.");
        // TODO
    }

    function addStudent(address student) public {
        require(msg.sender == professor, "Sender not authorized.");
        // TODO
    }

    function submitAnswer(bytes32 answer) public {
        // TODO
    }

    function revealAnswer() public view {
        require(msg.sender == professor, "Sender not authorized.");
        // TODO
    }

}