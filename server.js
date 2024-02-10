const dotenv = require('dotenv');
const connectMongo = require('./config/database');

const app = require("./app");

dotenv.config({
    path: "./config/.env"
})

connectMongo();


const port = process.env.PORT || 4000;

app.get("/",(req,res)=>{
    res.json("server is ready")
})


app.listen(port,()=>{
    console.log(`app lisening at http://localhost:${port}`);
})

