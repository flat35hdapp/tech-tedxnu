const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

//必要変数
    const SCOPES = ['https://www.googleapis.com/auth/drive.file',
                    'https://www.googleapis.com/auth/drive.appdata'];
    const TOKEN_PATH = './token.json';

//ドライブの諸々のID
    const templateFileId = `1JDIEJWDAE8RnihL55_zv-WMQ2oaXKXDFJzmHooM7cJs`;
    var targetFileId;
    /*フォルダ名minitesTemplateFolder*/
    const beforeFolderId = '1lUc9yYe2_hhPQKfDmvVhElNLxlw0JECt';
    /*フォルダ名minitesTemplate*/
    const targetFolderId = '1HbsnjXIRdY1US4EawT3Bf9LHiZgsRzTQ';


//メイン関数。これがモジュールの本体。
async function driveapi(mtgDataObj){
  const jsonFile = fs.readFileSync('credentials.json');
  const clientId = await authorize(JSON.parse(jsonFile));
  const URL      = await copyMinites(clientId, mtgDataObj);
  return new Promise(resolve => {
    resolve(URL);
  });
}


//authorize関数。credentials.jsonから認証させる。
async function authorize(credentials) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);
  const tok = fs.readFileSync(TOKEN_PATH);
  await oAuth2Client.setCredentials(JSON.parse(tok));
  return new Promise( resolve => {
    console.log('authorize() clear');
    resolve(oAuth2Client);
  });
}

    //新しくトークンを取得するときの関数。基本使わないが万が一トークンを消した時の保険。
    async function getNewToken(oAuth2Client) {
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
        });
      });
      return new Promise(resolve => {
        resolve(TOKEN_PATH);
      })
    }



//ドライブ操作のメイン関数。中に以下３つの関数が格納されている。
async function copyMinites(clientId, mtgDataObj) {
  console.log('copyMinites() start ');
  const drive    = await google.drive({version: 'v3', auth: clientId});
  const docs     = await google.docs({version: 'v1', auth: clientId});
  const responseURL = await copy(drive);
  await update(drive, mtgDataObj);
  await printDoc(docs, mtgDataObj);

  return new Promise(resolve =>{
    resolve(responseURL);
  });
}

    //copy関数。テンプレートをコピーして、コピー先のファイルのURLを返す。
    async function copy(drive){
      console.log('copy() start ');
      const copyParams = {
          fileId: templateFileId,
      };
      return new Promise(resolve => {
        drive.files.copy(copyParams)
        .then(function(res){
          targetFileId = res.data.id;
          console.log('copy()  end ' + targetFileId);
          const resURL = "https://docs.google.com/document/d/" + targetFileId;
          resolve(resURL);
        })
        .catch(err => {
          const resURL = 0;
          console.log(err);
          });

      });
    }
    //update関数。フォルダの移動、タイトル変更等行う。
    async function update(drive, mtgDataObj){
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
            .then(res => console.log('update()ok.'))
            .catch(err => console.log(err));
            console.log('update() end');
            return new Promise(resolve => {
              resolve();
            });
          }
    //printDoc関数。ファイル内のタイトルの置換、アジェンダの書き込みを行う。
    async function printDoc(docs, mtgDataObj) {
        console.log(`printDocTitle() start`);

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
        return new Promise(resolve => {
          resolve();
        });
  }


module.exports = {driveapi};
