const express = require('express');
const app = express();
import {router} as slackBot from './routes/slackBot.js';

app.use('/app/slack',slackBot(req,res));
app.listen(3000);
