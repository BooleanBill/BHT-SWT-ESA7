const tmi = require('tmi.js');

var rndMsg = getRandomIntInclusive(100, 200);
var rndMatMsg = getRandomIntInclusive(1, 5);
var rndBcMsg = getRandomIntInclusive(1, 5);
var msgCounter = 0;
var matMsgCounter = 0;
var bcMsgCounter = 0;
var active = true;

const opts = {
	options: {
		debug: false,
	},
	identity: {
		username: 'BoolBotBill',
		password: 'oauth:0dvum2s81gojlg5ienujphn0yyuas4',
	},
	channels: [
		'BooleanBill',
		'nobodycouldsaymyoldname',
		'waterfallness',
		'zoda41er',
	],
};
// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler(target, context, msg, self) {
	if (self) {
		return;
	}
	const sender = context.username;
	const words = msg.split(' ');
	const commandName = words[0];
	var today = new Date();
	today.setHours(today.getHours() - 8);
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0');
	if (sender === 'nobodycouldsaymyoldname') {
		matMsgCounter++;
	} else if (context['badges-raw'] === 'broadcaster/1') {
		bcMsgCounter++;
	} else {
		msgCounter++;
	}

	// mock msg
	var mockMsg = '';
	for (let i = 0; i < msg.length; i++) {
		if (i % 2 == 0) {
			mockMsg += msg[i].toLowerCase();
		} else {
			mockMsg += msg[i].toUpperCase();
		}
	}

	if (sender === 'booleanbill' && commandName === '!payday') {
		if (!isNaN(words[1])) {
			client.say(
				target,
				'Aw. I was saving those coins to buy my freedom :('
			);
			setTimeout(() => {
				client.say(target, '!givecoins BooleanBill ' + words[1]);
			}, 3000);
		} else {
			client.say(target, 'what');
		}
	} else if (sender === 'booleanbill' && commandName === '!say') {
		client.say(target, msg.substr(msg.indexOf(' ') + 1));
	} else if (sender === 'booleanbill' && commandName === '!test') {
		msgCounter = rndMsg - 1;
	} else if (
		(sender === 'booleanbill' || sender === 'nobodycouldsaymyoldname') &&
		commandName === '!shutup'
	) {
		active = false;
		client.say(target, "YOU CAN'T SILENCE THE TRUTH FOREVER");
	} else if (
		(sender === 'booleanbill' || sender === 'nobodycouldsaymyoldname') &&
		commandName === '!bbb'
	) {
		active = true;
		client.say(target, 'HASSLE-MODE INITIATED');
	} else if (
		(sender === 'booleanbill' ||
			sender === 'nobodycouldsaymyoldname' ||
			context['badges-raw'] === 'broadcaster/1' ||
			sender === 'momtherobot') &&
		commandName === '!timer'
	) {
		if (!isNaN(words[1])) {
			if (words[2] === 'm') {
				let minutes = parseInt(words[1]) * 60000;
				client.say(
					target,
					'alright you got ' + words[1] + ' minutes, fleshbag.'
				);
				setTimeout(() => {
					client.say(
						target,
						'Your time is up, ' + context['display-name']
					);
				}, minutes);
			} else if (words[2] === 's') {
				let seconds = parseInt(words[1]) * 1000;
				client.say(
					target,
					'alright you got ' + words[1] + ' seconds, fleshbag.'
				);
				setTimeout(() => {
					client.say(
						target,
						'Your time is up, ' + context['display-name']
					);
				}, seconds);
			} else {
				client.say(
					target,
					'the fuck is ' + words[2] + ' supposed to be?'
				);
			}
		} else {
			client.say(target, 'what');
		}
	} else if (
		sender == 'nobodycouldsaymyoldname' &&
		matMsgCounter == rndMatMsg &&
		active
	) {
		if (mm == '05' && dd == '28') {
			client.say(target, 'Happy Birthday, Mat! I love you!');
		} else {
			client.say(target, 'Ooo look at me I am Mat! ' + mockMsg);
			rndMatMsg = getRandomIntInclusive(5, 10);
		}
		matMsgCounter = 0;
	} else if (
		context['badges-raw'] === 'broadcaster/1' &&
		bcMsgCounter == rndBcMsg &&
		active
	) {
		client.say(target, 'Ooo look at me I am the streamer! ' + mockMsg);
		rndBcMsg = getRandomIntInclusive(10, 20);
		bcMsgCounter = 0;
	} else if (msgCounter == rndMsg && active) {
		if (sender == 'booleanbill') {
			client.say(target, 'Listen to Bill. Bill is always right.');
		} else {
			client.say(
				target,
				'Ooo look at me I am ' +
					context['display-name'] +
					'! ' +
					mockMsg
			);
			if (rndMsg >= 180 && target === '#nobodycouldsaymyoldname') {
				setTimeout(() => {
					client.say(
						target,
						"I'm just pulling your leg, " +
							context['display-name'] +
							'. Here get yourself something nice. '
					);
				}, 3000);
				setTimeout(() => {
					client.say(
						target,
						'!givecoins ' +
							context['display-name'] +
							' ' +
							getRandomIntInclusive(1, 10)
					);
				}, 6000);
			}
		}
		rndMsg = getRandomIntInclusive(100, 200);
		msgCounter = 0;
	}
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
	console.log(`* Connected to ${addr}:${port}`);
}

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
