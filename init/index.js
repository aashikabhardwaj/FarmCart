const mongoose = require("mongoose");
const initdata= require("./data.js");
const User= require("../models/user.js");

const MONGO_URL="mongodb://127.0.0.1:27017/farmcart";

async function main(){
    await mongoose.connect(MONGO_URL);
    console.log("db connected successfully");
}

main().then(()=>{
    console.log("connected to db");
})
.catch((err)=>{
    console.log(err);
});

const initDB= async()=>{
    await User.deleteMany({});
    await User.insertMany(initdata.data);
    console.log("data was initialised");
}
initDB();
