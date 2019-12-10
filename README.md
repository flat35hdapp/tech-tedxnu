# tech-tedxnu  
## how to use  
SlackのEvent request URLとaction URLをそれぞれ `http://hogehoge.com/api/events` と `http://hogehoge.com/api/actions`を登録する。
### need to use  
 - SLACK_BOT_TOKEN
 - TRELLO_API_KEY
 - TRELLO_API_TOKEN
## discription  
/app.js : 最初に起動する。サーバー本体。  
/routes : app.js に呼び出される機能をまとめたディレクトリ。開発はここを中心に行う。  
/routes/slackBot.js : /app/slack へのリクエストを捌く部分。  
/routes/slackTools : slackBot.js の機能でモジュール化したものを入れておくディレクトリ。  
/routes/  
