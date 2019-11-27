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
require('dotenv').config();

function mySqlSet(){

  const connection = mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PW,
      database: process.env.MYSQL_DB,
  });

  // Connectionを定義する
  connection.connect();

  let sql = 'select * from memberlist.user';
  connection.query(sql, (err, rows, fields) => {
      if (err) throw err;
      console.log('userテーブル: ', rows);
  });
  connection.end();
}

mySqlSet();
