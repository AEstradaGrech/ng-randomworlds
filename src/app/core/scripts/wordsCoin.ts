const { abi, address } = require('src/assets/contracts/WORDS-v0.0.1-sepolia.json');
import Web3 from 'web3';
export default (web3:Web3) => { return new web3.eth.Contract(abi, address)};