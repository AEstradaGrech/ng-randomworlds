import Web3 from 'web3';
const web3 = (document:Document)=>{
    console.log('this is the web3 provider method');
    let window:any = document.defaultView;
    if (window && window.ethereum) 
        return new Web3(window.ethereum);
    return undefined;
}
export default web3