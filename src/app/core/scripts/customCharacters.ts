const { contractABI } = require('src/assets/contracts/ImmutableCharacters-v0.0.1-sepolia.json');
import Web3 from 'web3';
export default (web3: Web3, address: string) => { return new web3.eth.Contract(contractABI, address);}