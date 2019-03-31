pragma solidity >=0.4.22 <0.6.0;

import "./CryptoQuizToken.sol";

contract CryptoQuizTokenSale {
    address payable admin;
    CryptoQuizToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    constructor(address _tokenContract, uint256 _tokenPrice) public {
        admin = msg.sender;
        tokenContract = CryptoQuizToken(_tokenContract);
        tokenPrice = _tokenPrice;
    }

    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x, 'multiply error');
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        require(msg.value == multiply(_numberOfTokens, tokenPrice), 'msg.value error');
        // emit Sell(address(this), _numberOfTokens);  // DEBUG
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens, 'tokenSale not enough tokens');
        require(tokenContract.transfer(msg.sender, _numberOfTokens), 'transfer error');

        tokensSold += _numberOfTokens;

        emit Sell(msg.sender, _numberOfTokens);
    }

    function endSale() public {
        require(msg.sender == admin, 'only admin can end sale');
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))), 'transfer remaining tokens to admin failed');

        // UPDATE: Let's not destroy the contract here
        // Just transfer the balance to the admin
        admin.transfer(address(this).balance);
    }
}
