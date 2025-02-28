import CryptoJs from "crypto-js";
export const encrypt = ({key,SECRET_KEY = process.env.SECRET_KEY})=>{
    return CryptoJs.AES.encrypt(key,SECRET_KEY).toString();
}
export const decrypt = ({key,SECRET_KEY = process.env.SECRET_KEY})=>{
    return CryptoJs.AES.decrypt(key,SECRET_KEY).toString(CryptoJs.enc.Utf8);
}