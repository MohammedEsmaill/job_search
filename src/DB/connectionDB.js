import mongoose from "mongoose";
const checkConnection = async ()=>{
    await mongoose.connect(process.env.URI_ONLINE).then(()=>{
        console.log("server connected mongoose successfully....");
    }).catch((error)=>{
        console.log("server error to connect mongoose....",error);
    })
}
export default checkConnection;