const express = require('express');
const app = express();
const slackBot = require('./routes/slackBot.js');

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/app/slack',slackBot.router);
app.listen(3000);
