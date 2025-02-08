const { abi, contractAddress } = require('src/assets/contracts/CrappyCoin-v0.0.01-sepolia.json');
import Web3 from 'web3';
export default (web3:Web3) => {return new web3.eth.Contract(abi, contractAddress)};