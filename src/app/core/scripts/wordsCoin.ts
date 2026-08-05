const { abi, contractAddress } = require('src/assets/contracts/WORDS_T-v0.0.1-localhost.json');
import Web3 from 'web3';
export default (web3:Web3) => {return new web3.eth.Contract(abi, contractAddress)};