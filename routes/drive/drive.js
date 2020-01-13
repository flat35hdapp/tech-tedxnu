const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const driveapi = function(){
  // If modifying these scopes, delete token.json.
  const SCOPES = ['https://www.googleapis.com/auth/drive.file',
                  'https://www.googleapis.com/auth/drive.appdata'];
  // The file token.json stores the user's access and refresh tokens, and is
  // created automatically when the authorization flow completes for the first
  // time.
  const TOKEN_PATH = 'token.json';
  const callback_method = [copyMinites];

  // Load client secrets from a local file.
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Docs API.
    authorize(JSON.parse(content), callback_method[0]);
  });

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
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

  function copyMinites(auth) {

      const templateFileId = `1JDIEJWDAE8RnihL55_zv-WMQ2oaXKXDFJzmHooM7cJs`;
      var targetFileId;
      /*フォルダ名minitesTemplateFolder*/
      const beforeFolderId = '1lUc9yYe2_hhPQKfDmvVhElNLxlw0JECt';
      /*フォルダ名minitesTemplate*/
      const targetFolderId = '1HbsnjXIRdY1US4EawT3Bf9LHiZgsRzTQ';
      const drive = google.drive({version: 'v3', auth});
      var mtgData = getMtgData();
      function copy(callback1,callback2){
        const copyParams = {
            fileId: templateFileId,
        };
        drive.files.copy(copyParams)
        .then(function(res){
          targetFileId = res.data.id;
          console.log('copy()  end ' + targetFileId);
          callback1(callback2)
        })
        .catch(err => console.log(err));
      }

      function update(callback){
        console.log('update() start');
        console.log(mtgData.date);
        const updateParams = {
            fileId: targetFileId,
            uploadType: 'multipart',
            addParents: targetFolderId,
            removeParents: beforeFolderId,
            fields: 'id, parents',
            requestBody: {name: mtgData.date}
        };
        drive.files.update(updateParams, )
        .then(res => console.log(res))
        .catch(err => console.log(err));
        console.log('update() end');
      }

      function printDocTitle() {
        const docs = google.docs({version: 'v1', auth});
        const reqests = [
                {
                  replaceAllText  : {
                            replaceText: mtgData.date,
                            containsText: {text: 'YYMMDD_タイトル', matchCase: true}
                        }
                }
              ];
        docs.documents.batchUpdate({
          documentId: targetFileId,
          requestBody: {
            requests: reqests
          }}, (err, res) => {
          if (err) return console.log('The API returned an error: ' + err);
          console.log(`success!!`);
        })};

      copy(update, printDocTitle);
  }

  function getMtgData(){
    var json = fs.readFileSync("sample.json", "utf-8");
    var obj = JSON.parse(json);
    var date = obj.m_date;
    return {date: date};
  }

  function create(auth){
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

  function createMinutes(auth){
    var mtgData = getMtgData();
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

}

module.exports = {driveapi};
