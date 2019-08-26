const User = require('./user');

pollsData = {
	/*'flai': {
		'isSecure': true,
		'listParticipants': {
			'0': 'Jai',
			'1': '',
			'2': '',
		},
		'questions': ["There?", "Yes?"],
		'totalParticipants': 10,
	}*/
}

class Poll {
	constructor(io) {
		this.io = io;
	}

	init() {
		this.attachIOEvents();
	}

	attachIOEvents() {
		this.io.on('connection', (socket) => {
			let user = new User(socket);

			this.io.sockets.emit('live polls', this.curatePolllList());
			socket.on('remove poll', pseudonym => this.removePoll(pseudonym))
			socket.on('update serverListParticipants', (data) => this.updatelist(data))
		})
	}
	addSurvey(data, socket) { 
		
	}
	curatePolllList() {
		const tempPolls = Object.keys(pollsData).map((unit) => {
			return {
					isSecure: pollsData[unit].isSecure,
					pseudonym: unit,
				}
		});
		return tempPolls;
	}
	fetchListQnP(req, res) {
		const { pseudonym } = req.body
		res.json(pollsData[pseudonym].questions);
	}
	handleListParticipants(req, res) {
		const { pseudonym } = req.body;
		res.status(200).json(pollsData[pseudonym].listParticipants);
	}
	handleNew(req, res) {
		const { isSecure, pseudonym, questions, totalParticipants } = req.body;
		const tempTotalParticipants = {};
		for(let i = 0; i < totalParticipants; ++i) {
			tempTotalParticipants[i] = '';
		}
		pollsData[pseudonym] = {
			'isSecure': isSecure,
			'listParticipants': tempTotalParticipants,
			'questions': questions,
			'totalParticipants': totalParticipants,
		}
		this.io.sockets.emit('live polls', this.curatePolllList());
		res.json({redirect: true})
	}
	handlePseudonym(req, res) {
		let isAvailable = true;
		const { pseudonym } = req.body;
		Object.keys(pollsData).forEach(data => {
			if(data === pseudonym)
				isAvailable = false;
		})

		if(isAvailable) {
			pollsData[pseudonym] = {};
			res.json({isAvailable: true})
		}
		else
			res.json({isAvailable: false})

	}
	removePoll(pseudonym) {
		delete pollsData[pseudonym];
		this.io.sockets.emit('live polls', this.curatePolllList());
	}
	updatelist(data) {
		pollsData[data.pseudonym].listParticipants[data.index] = data.name;
		this.io.sockets.emit('update clientListParticipants', pollsData[data.pseudonym].listParticipants)
	}
}

module.exports = Poll;