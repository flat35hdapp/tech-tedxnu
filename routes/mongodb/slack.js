const mongodb = require('mongodb');
const mongoClient = mongodb.mongoClient;
const mongoPort = process.env.MONGODB_PORT;
const dbName = "";
const hostUrl = "mongodb://localhost:" + mongoPort + "/";

const user = async (user_id) => {
  const collectionName = users;
  const client = await mongoClient.connect(hostUrl);
  const db = await client.db(dbName);
  const collection = db.collection(users);
  await collection.

}
module.exports = {user};
