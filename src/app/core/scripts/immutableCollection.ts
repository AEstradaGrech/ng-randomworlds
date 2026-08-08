const { collectionABI } = require('src/assets/contracts/ImmutableContracts-RandomWorlds-v0.1.0-sepolia.json');
import Web3 from 'web3';
export default (web3:Web3, address:string) => {return new web3.eth.Contract(collectionABI, address)};