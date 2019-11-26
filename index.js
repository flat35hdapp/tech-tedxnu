/*const express = require("express");
const app = express();

const server = app.listen(3000, function(){
  console.log("Node.js listens to PORT: " + server.address().port);
});

app.get("/mtg",function(req,res,next){
  res.json();
})
*/

/* sample.js */
'use strict'
const mysql = require('mysql');
async function mySqlSet(){
  // Connectionを定義する
  const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PW,
      database: process.env.MYSQL_DB,
  });
  let sql = 'select * from memberlist.user';
  await connection.connect();
  await connection.query(sql, (err, rows, fields) => {
      if (err) throw err;
      console.log('userテーブル: ', rows);
  });
  await connection.end();
}

mySqlSet();
