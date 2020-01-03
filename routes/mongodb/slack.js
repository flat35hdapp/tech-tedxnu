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
  console.log(result);
  return result
};
//指定したコレクションの指定した一つのアイテムのうちの、指定した一つのリストに配列を一つ追加する関数。
const update_list = async (where,set,collection_name) => {
  const client = await mongoClient.connect(hostUrl,{useUnifiedTopology: true});
  const db = await client.db(dbName);
  const collection = await db.collection(collection_name);
  const find_result = await collection.find(where).toArray();
  const target_key = await Object.keys(set)[0];
  const list = await find_result[0][target_key];
  await list.push(set[target_key]);
  const setting = await {$set:{[target_key]:list}};
  const update_result = await collection.updateMany(where,setting);
  await collection.find(where).toArray();
  client.close();
  return update_result;
};

const id = async (id) => {return mongodb.ObjectID(id)};

module.exports = {find,insert,update_list,id};
