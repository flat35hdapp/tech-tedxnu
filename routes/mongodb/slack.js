const mongodb = require('mongodb');
const mongoClient = mongodb.mongoClient;
const mongoPort = process.env.MONGODB_PORT;
const dbName = "";
const hostUrl = "mongodb://localhost:" + mongoPort + "/";

//初期設定欄
const users_collection = "users";
const mtgs_collection = "mtgs";

const find_user_by_user = async (user_id) => {
  const client = await mongoClient.connect(hostUrl);
  const db = await client.db(dbName);
  const collection = db.collection(users_collection);
  const docs = await collection.find({'sl_u_id':user_id}).toArray();
  client.close();
  return docs[0];
}

const insert_mtg = async (mtg_obj) => {//書きかけ注意！！！
  try{
    const client = await mongoClient.connect(hostUrl);
    const db = await client.db(dbName);
    const collection = db.collection(mtgs_collection);
    await collection.insert(mtg_obj);
    return new promise();
  }catch(err){
    return new error();
  }finally{
    client.close();
  }
}

module.exports = {find_user_by_user};
