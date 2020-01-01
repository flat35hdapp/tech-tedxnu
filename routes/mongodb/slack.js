/*global process*/
const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const mongoPort = process.env.MONGODB_PORT;
const dbName = "tech_tedxnu";
const hostUrl = "mongodb://localhost:" + mongoPort + "/";

//find関数。引数にオベジェクトと配列を取り、それに基づきqueryをmongodbに投げる。
const find = async (query,collection_name) => {
  if(Array.isArray(query)){
    const client = await mongoClient.connect(hostUrl,{useUnifiedTopology: true});
    const db = await client.db(dbName);
    const collection = await db.collection(collection_name);
    const docs = await Promise.all(query.map((q)=>{
      return collection.find(q).toArray();
    }));
    client.close();
    return docs;
  }else{
    const client = await mongoClient.connect(hostUrl,{useUnifiedTopology: true});
    const db = await client.db(dbName);
    const collection = await db.collection(collection_name);
    const docs = await collection.find(query).toArray();
    client.close();
    return docs;
  }
};
//insertしてくれる。引数に配列かオブジェクトを取り、それに基づいてmongodbにデータ挿入を行う。
const insert = async (obj,collection_name) => {
  let docs = [];
  if(Array.isArray(obj)){
    docs = obj;
  }else{
    docs[0] = obj;
  }
  const client = await mongoClient.connect(hostUrl,{useUnifiedTopology: true});
  const db = await client.db(dbName);
  const collection = await db.collection(collection_name);
  const result = await collection.insertMany(docs);
  client.close();
  return result
};

module.exports = {find,insert};
