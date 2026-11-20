import web3 from "web3";

export function checkAddresses(a:string, b:string){
    return web3.utils.toChecksumAddress(a) === web3.utils.toChecksumAddress(b);
}