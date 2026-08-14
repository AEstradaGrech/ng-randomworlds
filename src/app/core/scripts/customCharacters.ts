const { collectionABI } = require('src/assets/contracts/ImmutableCharactersSet-v0.1.1-sepolia.json');
import Web3 from 'web3';
export default (web3: Web3, address: string) => { return new web3.eth.Contract(collectionABI, address);}