const WebSocket = require('ws');


// WebSocket-сервер на порту 3000
const webSocketServer = new WebSocket.Server({
	port: 3000,
	clientTracking: true
});


//создаем класс для хранения юзеров
class Users {
	constructor() {
		this.usersOnline = {};
		this.usersOffline = {};
	}
	setUser(userName, client) {
		this.usersOnline[userName] = client
	}

	savePhoto(userName, src) {
		this.usersOnline[userName]['img'] = src
	}

	removeUser(userName) {
		this.usersOffline[userName] = this.usersOnline[userName]
		delete this.usersOnline[userName];


	}

	getUser(userName) {
		if (this.usersOffline[userName]) {
			this.usersOnline[userName] = this.usersOffline[userName]
		}
		delete this.usersOffline[userName];
		return this.usersOnline[userName]
	}


	getAllUsers() {
		return this.usersOnline
	}
	
	getOfflineUsers() {
		return this.usersOffline
	}

}

const users = new Users();
const currentUser = {};

webSocketServer.on('connection', function (ws) {
	ws.on('open', function() {
		webSocketServer.clients.forEach(client => {
				if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(users.getAllUsers()));
				}
			});
		console.log(users)
	});

	ws.on('message', function (message) {


		const msg = JSON.parse(message);
	

		if (msg.type === 'userSavePhoto') {
			users.savePhoto(msg.nick.toLowerCase(), msg.img);

			webSocketServer.clients.forEach(client => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(JSON.stringify({
						type: 'getAllUsers',
						users: users.getAllUsers
					}));					
				
				}
			});
		} else if (msg.type === 'userInfo') {
			currentUser.name = msg.name;
			currentUser.nick = msg.nick;
			currentUser.img = msg.img;
			currentUser.lastMes = msg.lastMes;

			if (!users.getUser(msg.nick.toLowerCase())) {
				users.setUser(msg.nick.toLowerCase(), msg)

			}		
			
			webSocketServer.clients.forEach(client => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(JSON.stringify({
						type: 'getAllUsers',
						users: users.getAllUsers(),
						offline: users.getOfflineUsers()
					}))
				}
			});
			

		} else {


			webSocketServer.clients.forEach(client => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(message);
					
				}
			});
		}

	});

	ws.on('close', function () {
		users.removeUser(currentUser.nick);
		webSocketServer.clients.forEach(client => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify({
					type: 'getAllUsers',
					users: users.getAllUsers(), 
					offline: users.getOfflineUsers()
				}))
			}
		});
	});

});
