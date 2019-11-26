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
function mySqlSet(){
  const mysql = require('mysql');
  const connection = mysql.createConnection({
      host: 'localhost',
      user: 'nodeuser',
      password: 'nodeuser',
      database: 'memberlist',
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
