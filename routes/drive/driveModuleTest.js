const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const drive = require('./drive.js');
var mtgDataObj = {
  m_name: "hoge MTG",
  m_t: [],
  m_date: "2020-01-16",
  m_s_t: "hh:mm",
  m_e_t: "hh:mm",
  m_pl: "hogehoge",
  m_agenda: ["hoge1", "hoge2", "hoge3"],
  m_rec_u: "http://document.google.com/hogehoge",
  m_tr_c:  "http://trello.com/hogehoge",
  half: [{"original_user_id":"hogehoge"}],
  att: [],
  abs: [],
  unans: []
}
//console.log(mtgDataObj.m_agenda[1]);

async function result(mtgDataObj){
  let  fileURL = await drive.driveapi(mtgDataObj);
  console.log('.......fileURLは....+ fileURL);
}

result(mtgDataObj);
