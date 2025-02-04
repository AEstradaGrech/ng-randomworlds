//import crypto from 'crypto';
import * as CryptoJS from 'crypto-js';
export default (encrypted:string) => {
    const decrypted = CryptoJS.AES.decrypt(encrypted, 'secret', {
         // Replace with vector
        iv:  CryptoJS.enc.Utf8.parse(CryptoJS.lib.WordArray.random(16).toString()),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
     
      });
      return decrypted.toString(CryptoJS.enc.Utf8);
}