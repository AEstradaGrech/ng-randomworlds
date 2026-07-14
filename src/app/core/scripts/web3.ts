import Web3 from 'web3';
const web3 = (document:Document)=>{
    console.log('this is the web3 provider method');
    let window:any = document.defaultView;
    if (window && window.ethereum) 
        return new Web3(window.ethereum);
    /*
    else{
        const provider = new Web3.providers.HttpProvider(dotEnv.parsed['INFURA_ENDPOINT']);
        web3 = new Web3(provider);
    }
    */
    return undefined; // Todo Truffle HDwallet provider
}
export default web3