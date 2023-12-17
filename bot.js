require('dotenv').config();

const tmi = require('tmi.js');

const MAT = 'nobodycouldsaymyoldname';
const BILL = 'booleanbill';
const DAVID = 'waterfallness';
const ALEX = 'zoda41er';
class BoolBotBill {
	options = {
		options: {
			debug: false,
		},
		identity: {
			username: 'BoolBotBill',
			password: 'oauth:' + process.env.OAUTH_TOKEN,
		},
		channels: [BILL, MAT, DAVID, ALEX],
	};
	counters = {
		_messages: 0,
		get messages() {
			return this._messages;
		},
		set messages(value) {
			this._messages = value;
		},
		_matMessages: 0,
		get matMessages() {
			return this._matMessages;
		},
		set matMessages(value) {
			this._matMessages = value;
		},
		_broadcasterMessages: 0,
		get broadcasterMessages() {
			return this._broadcasterMessages;
		},
		set broadcasterMessages(value) {
			this._broadcasterMessages = value;
		},
	};
	vars = {
		_randomMessage: 0,
		get randomMessage() {
			return this._randomMessage;
		},
		set randomMessage(value) {
			this._randomMessage = value;
		},
		_randomMatMessage: 0,
		get randomMatMessage() {
			return this._randomMatMessage;
		},
		set randomMatMessage(value) {
			this._randomMatMessage = value;
		},
		_randomBcMessage: 0,
		get randomBcMessage() {
			return this._randomBcMessage;
		},
		set randomBcMessage(value) {
			this._randomBcMessage = value;
		},
		_active: true,
		get active() {
			return this._active;
		},
		set active(value) {
			this.active = value;
		},
	};
	admins = [BILL, MAT];

	constructor() {
		this.generateNewRandoms();

		// Create a client with our options
		this.client = new tmi.client(this.options);

		// Register our event handlers (defined below)
		this.client.on('message', this.onMessageHandler.bind(this));
		this.client.on('connected', this.onConnectedHandler.bind(this));

		// Connect to Twitch:
		this.client.connect();
	}

	/**
	 * Handles incoming messages.
	 *
	 * @param {string} target - The target of the message.
	 * @param {object} context - The context of the message.
	 * @param {string} msg - The content of the message.
	 * @param {boolean} me - Indicates if the message is from the bot itself.
	 */
	onMessageHandler(target, context, msg, me) {
		this.active = true;
		if (me) {
			return;
		}
		const sender = context.username;
		const words = msg.split(' ');
		const commandName = words[0];

		var { mm, dd } = this.getCurrentMonthAndDay();

		if (sender === MAT) {
			this.counters.matMessages++;
		} else if (this.senderIsBroadcaster(context)) {
			this.counters.broadcasterMessages++;
		} else {
			this.counters.messages++;
		}

		// mock msg
		var mockMsg = this.createMockMessage(msg);

		if (sender === BILL && commandName === '!payday') {
			this.handlePaydayCommand(words, target);
		} else if (sender === BILL && commandName === '!say') {
			this.repeatMessage(target, msg);
		} else if (sender === BILL && commandName === '!test') {
			this.handleTestCommand();
		} else if (
			(sender === BILL || sender === MAT) &&
			commandName === '!shutup'
		) {
			this.deactivateBot(target);
		} else if (
			(sender === BILL || sender === MAT) &&
			commandName === '!bbb'
		) {
			this.activateBot(target);
		} else if (
			(this.userIsAdmin(sender) ||
				this.senderIsBroadcaster(context) ||
				sender === 'momtherobot') &&
			commandName === '!timer'
		) {
			this.handleTimerCommand(words, target, context);
		} else if (
			sender == MAT &&
			this.counters.messages == this.vars.randomMatMessage &&
			this.vars.active
		) {
			this.handleMatMessage(mm, dd, target, mockMsg);
		} else if (
			this.senderIsBroadcaster(context) &&
			this.counters.broadcasterMessages == this.vars.randomBcMessage &&
			this.vars.active
		) {
			this.handleBroadcasterMessage(target, mockMsg);
		} else if (
			this.counters.messages == this.vars.randomMessage &&
			this.vars.active
		) {
			this.handleRegularMessage(sender, target, context, mockMsg);
		}
	}

	/**
	 * Handles a regular message.
	 *
	 * @param {string} sender - The sender of the message.
	 * @param {string} target - The target of the message.
	 * @param {object} context - The context of the message.
	 * @param {string} mockMsg - The mock message.
	 */
	handleRegularMessage(sender, target, context, mockMsg) {
		console.log(this.counters.messages);
		if (sender == BILL) {
			this.client.say(target, 'Listen to Bill. Bill is always right.');
		} else {
			this.client.say(
				target,
				'Ooo look at me I am ' +
					context['display-name'] +
					'! ' +
					mockMsg
			);
			if (
				this.vars.randomMessage >= 180 &&
				target === '#nobodycouldsaymyoldname'
			) {
				this.handleSpecialMatViewerMessage(target, context);
			}
		}
		this.vars.randomMessage = this.getRandomIntInclusive(100, 200);
		this.counters.messages = 0;
	}

	/**
	 * Handles broadcaster messages.
	 * @param {string} target - The target of the message.
	 * @param {string} mockMsg - The mock message to be sent.
	 */
	handleBroadcasterMessage(target, mockMsg) {
		this.client.say(target, 'Ooo look at me I am the streamer! ' + mockMsg);
		this.vars.randomBcMessage = this.getRandomIntInclusive(10, 20);
		this.counters.messages = 0;
	}

	/**
	 * Handles the Mat message based on the given parameters.
	 * If it's Mat's birthday, sends a birthday message.
	 * Otherwise, sends a mock message with a random number and updates the randomMatMessage variable.
	 * Also resets the messages counter.
	 *
	 * @param {number} mm - The month of Mat's birthday.
	 * @param {number} dd - The day of Mat's birthday.
	 * @param {string} target - The target channel or user to send the message to.
	 * @param {string} mockMsg - The mock message to send when it's not Mat's birthday.
	 * @returns {void}
	 */
	handleMatMessage(mm, dd, target, mockMsg) {
		if (this.itsMatsBirthday(mm, dd)) {
			this.client.say(target, 'Happy Birthday, Mat! I love you!');
		} else {
			this.client.say(target, 'Ooo look at me I am Mat! ' + mockMsg);
			this.vars.randomMatMessage = this.getRandomIntInclusive(5, 10);
		}
		this.counters.messages = 0;
	}

	/**
	 * Handles a special MatViewer message.
	 * @param {string} target - The target of the message.
	 * @param {object} context - The context of the message.
	 */
	handleSpecialMatViewerMessage(target, context) {
		setTimeout(() => {
			this.client.say(
				target,
				"I'm just pulling your leg, " +
					context['display-name'] +
					'. Here get yourself something nice. '
			);
		}, 3000);
		setTimeout(() => {
			this.client.say(
				target,
				'!givecoins ' +
					context['display-name'] +
					' ' +
					getRandomIntInclusive(1, 10)
			);
		}, 6000);
	}

	/**
	 * Checks if it's Mat's birthday.
	 * @param {string} mm - The month in two-digit format (e.g., '05' for May).
	 * @param {string} dd - The day in two-digit format (e.g., '28' for the 28th).
	 * @returns {boolean} - True if it's Mat's birthday, false otherwise.
	 */
	itsMatsBirthday(mm, dd) {
		return mm == '05' && dd == '28';
	}

	/**
	 * Handles the timer command.
	 *
	 * @param {Array} words - The command words.
	 * @param {string} target - The target of the command.
	 * @param {Object} context - The context of the command.
	 */
	handleTimerCommand(words, target, context) {
		if (!isNaN(words[1])) {
			if (words[2] === 'm') {
				let minutes = parseInt(words[1]) * 60000;
				this.client.say(
					target,
					'alright you got ' + words[1] + ' minutes, fleshbag.'
				);
				setTimeout(() => {
					this.client.say(
						target,
						'Your time is up, ' + context['display-name']
					);
				}, minutes);
			} else if (words[2] === 's') {
				let seconds = parseInt(words[1]) * 1000;
				this.client.say(
					target,
					'alright you got ' + words[1] + ' seconds, fleshbag.'
				);
				setTimeout(() => {
					this.client.say(
						target,
						'Your time is up, ' + context['display-name']
					);
				}, seconds);
			} else {
				this.client.say(
					target,
					'the fuck is ' + words[2] + ' supposed to be?'
				);
			}
		} else {
			this.client.say(target, 'what');
		}
	}

	/**
	 * Checks if the sender is the broadcaster.
	 * @param {object} context - The context object containing information about the sender.
	 * @returns {boolean} - Returns true if the sender is the broadcaster, false otherwise.
	 */
	senderIsBroadcaster(context) {
		return context['badges-raw'] === 'broadcaster/1';
	}

	/**
	 * Activates the bot and sends a message to the specified target.
	 * @param {string} target - The target to send the message to.
	 * @returns {void}
	 */
	activateBot(target) {
		this.active = true;
		this.client.say(target, 'HASSLE-MODE INITIATED');
	}

	/**
	 * Deactivates the bot.
	 * @param {string} target - The target channel or user to send the message to.
	 * @returns {void}
	 */
	deactivateBot(target) {
		this.active = false;
		this.client.say(target, "YOU CAN'T SILENCE THE TRUTH FOREVER");
	}

	/**
	 * Handles the test command.
	 */
	handleTestCommand() {
		this.counters.messages = this.vars.randomMessage - 1;
	}

	/**
	 * Repeats a message in the chat.
	 * @param {string} target - The target channel or user to send the message to.
	 * @param {string} msg - The message to be repeated.
	 */
	repeatMessage(target, msg) {
		this.client.say(target, msg.substr(msg.indexOf(' ') + 1));
	}

	/**
	 * Handles the payday command.
	 *
	 * @param {Array} words - The words passed as arguments to the command.
	 * @param {string} target - The target channel or user.
	 */
	handlePaydayCommand(words, target) {
		if (!isNaN(words[1])) {
			this.client.say(
				target,
				'Aw. I was saving those coins to buy my freedom :('
			);
			setTimeout(() => {
				this.client.say(target, '!givecoins BooleanBill ' + words[1]);
			}, 3000);
		} else {
			this.client.say(target, 'what');
		}
	}

	/**
	 * Creates a mock message by alternating the case of each character in the input message.
	 * @param {string} msg - The input message.
	 * @returns {string} - The mock message with alternating case.
	 */
	createMockMessage(msg) {
		var mockMsg = '';
		for (let i = 0; i < msg.length; i++) {
			if (i % 2 == 0) {
				mockMsg += msg[i].toLowerCase();
			} else {
				mockMsg += msg[i].toUpperCase();
			}
		}
		return mockMsg;
	}

	/**
	 * Returns the current month and day.
	 * @returns {Object} An object containing the current month and day.
	 * @property {string} mm - The current month.
	 * @property {string} dd - The current day.
	 */
	getCurrentMonthAndDay() {
		var today = new Date();
		today.setHours(today.getHours() - 8);
		var dd = String(today.getDate()).padStart(2, '0');
		var mm = String(today.getMonth() + 1).padStart(2, '0');
		return { mm, dd };
	}

	/**
	 * Generates new random numbers and assigns them to variables.
	 */
	generateNewRandoms() {
		this.vars.randomMessage = this.getRandomIntInclusive(100, 200);
		this.vars.randomMatMessage = this.getRandomIntInclusive(1, 5);
		this.vars.randomBcMessage = this.getRandomIntInclusive(1, 5);
		console.log(this.vars.randomMessage);
	}

	/**
	 * Handles the event when the bot is connected to a server.
	 *
	 * @param {string} addr - The address of the server.
	 * @param {number} port - The port number of the server.
	 */
	onConnectedHandler(addr, port) {
		console.log(`* Connected to ${addr}:${port}`);
	}

	/**
	 * Checks if a user is an admin.
	 * @param {string} user - The user to check.
	 * @returns {boolean} - True if the user is an admin, false otherwise.
	 */
	userIsAdmin(user) {
		return this.admins.includes(user);
	}

	/**
	 * Generates a random integer between the specified minimum and maximum values (inclusive).
	 * @param {number} min - The minimum value.
	 * @param {number} max - The maximum value.
	 * @returns {number} - The random integer.
	 */
	getRandomIntInclusive(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}

new BoolBotBill();
