# CryptoQuiz

## Introduction

**CryptoQuiz** is a Dapp for off-classroom quizzes. It is a new way to run a fair, transparent, yet secure quiz. Professor can open questions and let students to submit their answers. Once the question expire and answer is revealed, awards will be sent to students who had the correct answer.

To keep their answers obscure and secret on the chain, we adopt public-key signing method with nonce. Only professor, who holds the private key of the question, can see or reveal the answer.

## Getting Started

### Install Dependencies

- Node.js
- Truffle Framework
  - `npm install -g truffle`
- Ganache
  - https://truffleframework.com/ganache
- MetaMask on Google Chrome
- `npm install`

Basic structure is based on https://truffleframework.com/boxes/pet-shop.

### Useful Commands

```bash
truffle develop
truffle compile
truffle migrate
npm run dev
```

## Resources

### Tutorial

- http://www.dappuniversity.com/articles/the-ultimate-ethereum-dapp-tutorial


### Cryptography

We use EC (Ellipis-Curve) cryptography to encrypt & decrypt message. We may use the following libraries:

- https://github.com/bitchan/eccrypto
- https://github.com/jpillora/eccjs
