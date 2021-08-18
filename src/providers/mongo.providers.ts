const { MongoClient } = require("mongodb");
import * as dotenv from "dotenv";


dotenv.config()
const client = new MongoClient(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  


export default client