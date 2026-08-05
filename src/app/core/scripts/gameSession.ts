const { contractABI } = require('src/assets/contracts/GameSession-ImmutableRandomQuests-v0.0.1-localhost.json');
import Web3 from 'web3';
export default (web3: Web3, address: string) => { return new web3.eth.Contract(contractABI, address);}