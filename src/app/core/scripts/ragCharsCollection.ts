const { abi } = require('src/assets/contracts/ImmutableCollection-v0.0.12.json');
import Web3 from 'web3';
export default (web3:Web3, address:string) => {return new web3.eth.Contract(abi, address)}; ////0xA43DaCA8B909AB78367b3F1814A1080D92e05510