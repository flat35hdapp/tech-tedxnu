const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

 function driveapi(mtgDataObj){
  // If modifying these scopes, delete token.json.
  const SCOPES = ['https://www.googleapis.com/auth/drive.file',
                  'https://www.googleapis.com/auth/drive.appdata'];
  // The file token.json stores the user's access and refresh tokens, and is
  // created automatically when the authorization flow completes for the first
  // time.
  const TOKEN_PATH = 'token.json';
  const callback_method = [copyMinites];

  // Load client secrets from a local file.
  async function main(){
    let result = new Promise((resolve,reject) =>{
      fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Docs API.
        authorize(JSON.parse(content), callback_method[0]);
      });
    })

      return await result;
  }


  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */

  //以下二つの関数は必須！
  function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getNewToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }

  function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) console.error(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
    });
  }

  //以下、必要な関数作る。

  //main巻数。テンプレートからコピーしてデータ挿入までやる。returnは作成ファイルのURL。
  async function copyMinites(auth) {

    let result = new Promise((resolve,reject) =>{
      const templateFileId = `1JDIEJWDAE8RnihL55_zv-WMQ2oaXKXDFJzmHooM7cJs`;
      var targetFileId;
      /*フォルダ名minitesTemplateFolder*/
      const beforeFolderId = '1lUc9yYe2_hhPQKfDmvVhElNLxlw0JECt';
      /*フォルダ名minitesTemplate*/
      const targetFolderId = '1HbsnjXIRdY1US4EawT3Bf9LHiZgsRzTQ';
      const drive = google.drive({version: 'v3', auth});
      function copy(callback1,callback2){
        const copyParams = {
            fileId: templateFileId,
        };
        drive.files.copy(copyParams)
        .then(function(res){
          targetFileId = res.data.id;
          console.log('copy()  end ' + targetFileId);
          global.url = "https://docs.google.com/document/d/" + targetFileId;
          callback1(callback2);
        })
        .catch(err => console.log(err));
      }

      function update(callback){
        console.log('update() start');
        console.log(mtgDataObj.m_date);
        const updateParams = {
            fileId: targetFileId,
            uploadType: 'multipart',
            addParents: targetFolderId,
            removeParents: beforeFolderId,
            fields: 'id, parents',
            requestBody: {name: mtgDataObj.m_date}
        };
        drive.files.update(updateParams, )
        .then(res => console.log(res))
        .catch(err => console.log(err));
        console.log('update() end');
        callback();
      }

      function printDocTitle() {
        console.log(`printDocTitle() start`);
        const docs = google.docs({version: 'v1', auth});
        var agLiLen = mtgDataObj.m_agenda.length;

        if (agLiLen == 0) {
          for (var i = 0; i < mtgDataObj.m_agenda; i++) {
          mtgDataObj.m_agenda[i] = " ";
        }}else if (agLiLen == 1) {
          for (var i = 1; i < mtgDataObj.m_agenda; i++) {
          mtgDataObj.m_agenda[i] = " ";
        }}else if (agLiLen == 2) {
          for (var i = 2; i < mtgDataObj.m_agenda; i++) {
          mtgDataObj.m_agenda[i] = " ";
        }};

        console.log(mtgDataObj.m_agenda)

        const requests = [
                {
                  "replaceAllText"  : {
                            "containsText": {"matchCase": true ,"text": "YYMMDD_タイトル"},
                            "replaceText": mtgDataObj.m_date
                        }
                },
                {
                  "replaceAllText"  : {
                            "containsText": {"matchCase": true ,"text": "m_agenda1"},
                            "replaceText":mtgDataObj.m_agenda[0]
                        }
                },
                {
                  "replaceAllText"  : {
                            "containsText": {"matchCase": true ,"text": "m_agenda2"},
                            "replaceText":mtgDataObj.m_agenda[1]
                        }
                },
                {
                  "replaceAllText"  : {
                            "containsText": {"matchCase": true ,"text": "m_agenda3"},
                            "replaceText":mtgDataObj.m_agenda[2]
                        }
                }
              ];
        const param = {'documentId': targetFileId,
                       'resource': {'requests': requests}};

        function batch(){
          docs.documents.batchUpdate(param, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            if (res) return console.log(`success!!`);
          });
        }

        //param変数に値を代入する前にbatchupdateを実行してしまうのを防ぐ。
        setTimeout(batch, '1500');

        };

      copy(update, printDocTitle);

    })
    //(C)awaitで非同期処理の結果を待つ
    //resultの処理が返ったら関数の呼び出し元に返す
    return await result;
  }

  //このアプリ権限で操作できる議事録ファイルの作成
  function createMinutes(auth){
    const drive = google.drive({version: 'v3', auth});
    var fileMetadata = {
      'name': '議事録',
      'mimeType': 'application/vnd.google-apps.document',
      'parent': ['1sb-ZmnIJFN78rBwOrZFHYK4QoSZ33iGI']
    };
    drive.files.create({
      resource: fileMetadata,
      fields: 'id'
    }, function (err, file) {
      if (err) {
        // Handle error
        console.error(err);
      } else {
        console.log('Folder Id: ', file.id);
      }
    });
  }

  //このアプリ権限で操作できるフォルダの作成
  function create(auth){
    const drive = google.drive({version: 'v3', auth});
    var fileMetadata = {
      name : 'minitesTemplate',
      mimeType : 'application/vnd.google-apps.folder'
    };
    drive.files.create({
      resource: fileMetadata
    }, function (err, file) {
      if (err) {
        // Handle error
        console.error(err);
      } else {
        console.log('Folder Id: ', file.id);
      }
    });
  }

  main().then((res)=>{
    console.log("Async function is " + res)
  });

}

module.exports = {driveapi};
