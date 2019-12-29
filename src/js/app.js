//
//if (!window.WebSocket) {
//	console.log('WebSocket в этом браузере не поддерживается.');
//}
//

(function initial() {


	let init = false;

	let usersOnlineArr = [];


	const blockError = document.querySelector('.error');
	const titleError = document.querySelector('.error__title');
	const errorBtn = document.querySelector('.error__btn');

	const usersList = document.querySelector('.participant');
	const usersOnline = document.querySelector('.chat__participants');

	const storage = localStorage;
	const users = JSON.parse(storage.data || '[]');

	let currentUser = {};

	let thisUsers = [];
	let sendUser = {};

	const socket = new WebSocket('ws://localhost:3000');

	errorBtn.addEventListener('click', function () {

		closeFade(blockError);
	});

	(function autorize() {
		const app = document.querySelector('.app');
		const autorizeBlock = document.querySelector('.authorisation');
		const inputName = document.querySelector('#authorisation-name');
		const inputNick = document.querySelector('#authorisation-nick');
		const authForm = document.querySelector('.authorisation__form');
		const enterBtn = document.querySelector('.authorisation__enter');

		authForm.addEventListener('submit', function (e) {

			e.preventDefault();

			currentUser.name = inputName.value;
			currentUser.nick = inputNick.value;
			currentUser.type = 'userInfo';
			currentUser.lastMes = '';
			currentUser.img = '';

			for (let user of users) {
				if (inputName.value != user.name && inputNick.value === user.nick) {
					titleError.textContent = "Пользователь с таким ником уже существует";
					OpenFade(blockError);
					throw new Error('nick exists')
				} else if (inputName.value == user.name && inputNick.value === user.nick) {
					currentUser = user;
				}
			}

			if (inputName.value.length < 3 || inputNick.value.length < 3) {
				titleError.textContent = "Поля должны содержать не менее 3 символов";
				OpenFade(blockError);
			} else {

				users.push(currentUser);
				storage.data = JSON.stringify(users);
				//			storage.data = '';

				inputName.value = '';
				inputNick.value = '';

				autorizeBlock.style.display = 'none';
				OpenFade(app);
				init = true;
				if (init === true) {
					socket.send(JSON.stringify(currentUser));
				}

				init = false;
			}
		});
	})();



	socket.addEventListener('open', function (e) {

	});

	socket.addEventListener('close', function () {
		socket.send(JSON.stringify(currentUser));
		//	init = false;
	});

	socket.addEventListener('error', function () {
		socket.send(JSON.stringify(currentUser));
		//	init = false;
	});

	socket.addEventListener('message', function (e) {

		const users = JSON.parse(e.data);
		for (let key in users.users) {
			thisUsers.push(users.users[key]);
		}

		function initPhoto() {
			const asideAva = document.querySelector(`#asideAva${currentUser.nick}`);
			//		const chatAva = document.querySelectorAll(`#chatAva${currentUser.nick}`);

			for (let key in users.users) {
				if (currentUser.nick === users.users[key].nick) {

					if (asideAva) {
						asideAva.setAttribute('src', `${users.users[key].img}`);
					}
					//				if (chatAva) {
					//					if (chatAva.length > 1) {
					//						chatAva.forEach(ava => {
					//							ava.setAttribute('src', `${users.users[key].img}`);
					//						})
					//					} else if (chatAva.length == 1) {
					//						console.log(users.users[key].img)
					//						chatAva.setAttribute('src', `${users.users[key].img}`);
					//					}
					//				}
				}
			}
		}
		if (users.type == 'getAllUsers') {

			//			function inizialize() {
			usersOnlineArr = [];

			const onlineUsers = users.users;

			for (key in onlineUsers) {

				usersOnlineArr.push(onlineUsers[key]);

				let usersItem = '';
				usersOnlineArr.forEach(function (user) {

					if (currentUser.nick === user.nick) {
						user = currentUser;
					}
					usersItem += `<li class="participant__item">
	              <div class="participant__ava-wrap"><img class="participant__ava" src="${user.img}" id="asideAva${user.nick}"></div>
	              <div class="participant__info">
	                <h3 class="participant__name"> ${user.name}</h3>
	                <div class="participant_mes" id="lastmessage${user.nick}"> ${user.lastMes} </div>
	              </div>
	            </li>`
				});

				usersList.innerHTML = usersItem;
				usersOnlineCount();
				initPhoto();

			}

			if (currentUser.type == 'userSavePhoto') {
				initPhoto();
			}

		} else {

			console.log(sendUser);
			addMes(JSON.parse(e.data));
		};
	});

	function addMes(mes) {

		const ChatList = document.querySelector('.chat__mes-list');
		
		for (us of thisUsers) {
				if (us.nick === currentUser.nick) {
					sendUser = us;
				}
			}

		const date = new Date();
		let hour = date.getHours();
		let minutes = date.getMinutes();
		let currentDate = `${hour}:${minutes}`;

		const mesTemplate = `
	                <div class="chat__ava-wrap"><img class="chat__ava" src="${sendUser.img}" id="chatAva${sendUser.nick}" ></div>
	              
					<div class="chat__message">
					<span class="chat__text"> ${mes}</span>
					<span class="chat__date"> ${currentDate} </span> </div>	`;

		const liMes = document.createElement('li');
		liMes.classList.add('chat__messages');
		liMes.innerHTML = mesTemplate;

		ChatList.appendChild(liMes);

	};

	function usersOnlineCount() {
		let count = usersOnlineArr.length;
		let end = '';

		if (count > 10 && count < 20 || count >= 5) {
			end = 'ов'
		} else if (count >= 2 && count <= 4) {
			end = 'a'
		}
		usersOnline.textContent = `${count} участник${end}`
	};

	(function openMenu() {
		const menuBtn = document.querySelector('.aside__menu--btn');
		const photoModal = document.querySelector('.photo__wrap--modal');
		const photoModalName = document.querySelector('.photo__name');
		const closeBtn = document.querySelector('.photo__modal-close');


		menuBtn.addEventListener('click', function () {
			OpenFade(photoModal);
			photoModalName.textContent = currentUser.name;
		});

		closeBtn.addEventListener('click', function () {
			closeFade(photoModal);

		});

	})();

	(function loadPhoto() {
		const inputLoad = document.querySelector('.photo__modal-wrap');
		const modalPhoto = document.querySelector('.photo__wrap--modal');
		const modalLoad = document.querySelector('.photo__wrap--load');
		const cancelBtn = document.querySelector('#photo-cancel');
		const loadBtn = document.querySelector('#photo-save');
		const photoBlock = document.querySelector('.photo__load-ava');

		const fileReader = new FileReader();
		let photoSend;
		const loaduserPhoto = document.querySelector('.photo__load-ava');


		fileReader.addEventListener('load', function () {
			photoBlock.src = fileReader.result;
		});

		inputLoad.addEventListener('change', function (e) {
			closeFade(modalPhoto);
			OpenFade(modalLoad);

			const file = e.target.files[0];

			if (file) {
				if (file.size > 512 * 1024) {
					OpenFade(blockError);
					titleError.textContent = 'Слишком большой файл'
				} else {
					fileReader.readAsDataURL(file);

				}
			}

		});

		cancelBtn.addEventListener('click', function () {
			closeFade(modalLoad);
		});

		loadBtn.addEventListener('click', function () {
			const currentAva = document.querySelector(`#asideAva${currentUser.nick}`);
			const chatAvas = document.querySelectorAll('.chat__ava');

			photoSend = loaduserPhoto.getAttribute('src');
			currentUser.img = photoSend;
			currentUser.type = 'userSavePhoto';

			socket.send(JSON.stringify(currentUser));
			currentAva.setAttribute('src', currentUser.img);
			if (chatAvas.length > 0) {
				for (let chatAva of chatAvas) {
					let avaId = chatAva.getAttribute('id');
					if (avaId === `chatAva${currentUser.nick}`) {
						chatAva.setAttribute('src', currentUser.img);
					}

				}
			}

			closeFade(modalLoad);
		})
	})();

	(function sendMessage() {
		const inputMes = document.querySelector('.chat__input');
		const inputform = document.querySelector('.chat__form');
		const btnSend = document.querySelector('.chat__send-btn');

		btnSend.addEventListener('click', function (e) {
			e.preventDefault();

			currentUser.type = 'sendMessage';
			currentUser.lastMes = inputMes.value;

			socket.send(JSON.stringify(inputMes.value));

			inputMes.value = '';
			
		});

	})();


	function OpenFade(modal) {
		let opO = 0;

		modal.style.display = 'flex';
		modal.style.opacity = opO;

		setTimeout(function fadeIn() {
			opO += 0.1;
			if (opO < 1) {

				modal.style.opacity = opO;
			}
			setTimeout(fadeIn, 50);
		}, 300);

	};

	function closeFade(modal) {
		let opC = 1;

		setTimeout(function fadeOut() {
			opC -= 0.1;
			if (opC > 0) {
				modal.style.opacity = opC;
				setTimeout(fadeOut, 50);

			} else {
				modal.style.display = 'none';
			}

		}, 300);

	};
})();
