const mongoose = require('mongoose');

mongoose.set('strictQuery', false)

const connectMongo = ()=>{
    mongoose.connect(process.env.MONGO_URI)
    .then((res)=>{console.log('connected')})
    .catch((err)=>{console.log(err);});
}


module.exports = connectMongo;