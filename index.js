import bootstrap from "./src/app.controller.js";
import dotenv from "dotenv";
import path from "path";
dotenv.config({path:path.resolve("src/config/.env")});
import express from "express";
import cron from "node-cron"
import { deleteExpiredOtp } from "./src/modules/users/user.service.js";
import { runIo } from './src/modules/socket/socket.js';
import fs from 'fs';
const app = express();
const port = process.env.PORT;
bootstrap(app,express)
const httpServer = app.listen(port, () => console.log(`Example app listening on port ${port}!`));
const io =runIo(httpServer)
app.set('io',io)
// delete Expired Otp
cron.schedule("0 */6 * * *",deleteExpiredOtp);

// Bounce
// 1-
// var canJump = function(nums) {
//     let isfalse = true;
//     for(let i =0;i<nums.length-1;i++){
//         if(nums[i]==0){
//             return false;
//             isfalse = false
//             break
//         }
//     }
//     if(isfalse){
//         return true
//     }
// };

// 2-

// function separteFile(){
//   fs.mkdirSync("./seprate",{recursive:true})
//   let thePath = path.join(__dirname,"seprate")
//   fs.writeFileSync(path.join(thePath,"bouns.js"),"")
// }
// separteFile()

// 3

// function copyOfCode() {
//     const code = fs.readFileSync(__filename)
//     let thePath = path.join(__dirname,"seprate")
//     fs.writeFileSync(path.join(thePath,"bouns.js"),code)
// }
// copyOfCode()