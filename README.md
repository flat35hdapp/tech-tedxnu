# tech-tedxnu  
## how to use  
SlackのEvent request URLとaction URLをそれぞれ `http://hogehoge.com/api/events` と `http://hogehoge.com/api/actions`を登録する。
drive.jsについて
drive.jsにはdriveapiモジュールが格納されている。使用するときは、drive.jsと同階層にcredentials.jsonとtoken.jsonをおき、
    const drive = require('./drive.js');
    const mtgDataJson = 'sample.json';
    drive.driveapi(mtgDataJson);
のように使用する。
### need to use  
 - SLACK_BOT_TOKEN
 - TRELLO_API_KEY
 - TRELLO_API_TOKEN
 - credentials.json : クライアントIDから生成する
 - token.json : アプリケーションを許可するときに発行する。
## discription  
/app.js : 最初に起動する。サーバー本体。  
/routes : app.js に呼び出される機能をまとめたディレクトリ。開発はここを中心に行う。  
/routes/slackBot.js : /app/slack へのリクエストを捌く部分。  
/routes/slackTools : slackBot.js の機能でモジュール化したものを入れておくディレクトリ。  
/routes/drive : テンプレートにmtgデータを代入して議事録生成する。
