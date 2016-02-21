'use strict';

const config = require('config');
const zmq = require('zmq');
const TelegramBot = require('node-telegram-bot-api');

// Telegram configs
const BOT_TOKEN = config.get('telegram.bot-token');
const CHAT_ID = config.get('telegram.chat-id');

const socket = zmq.socket('sub');

let bot;

function init() {
  bot = new TelegramBot(BOT_TOKEN);

  socket.connect(config.get('mq.uri'));
  socket.subscribe(config.get('mq.topic'));
  socket.on('message', handleMessage);
}

function handleMessage(topic, data) {
  const message = JSON.parse(data);

  const instrument = message.instrument;
  const botMessage =
    '*TRADEMACH SIGNAL*\n' +
    `- STR: \`${message.strategy}\`\n` +
    `- INS: \`${instrument}\`\n` +
    `- SIG: \`${message.signal}\`\n` +
    `- BID: \`${message.bid}\`\n` +
    `- ASK: \`${message.ask}\``;

  bot.sendMessage(CHAT_ID, botMessage, { parse_mode: 'Markdown' })
    .then(data => console.log(`messaged - ${instrument}`));
}

init();
