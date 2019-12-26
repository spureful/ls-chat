//
//if (!window.WebSocket) {
//	console.log('WebSocket в этом браузере не поддерживается.');
//}
//


const wrapper = document.querySelector('.wrapper');

const blockError = document.querySelector('.error');
const titleError = document.querySelector('.error__title');
const errorBtn = document.querySelector('.error__btn');

const usersList = document.querySelector('.participant');
const usersOnline = document.querySelector('.chat__participants');


const storage = localStorage;
const users = JSON.parse(storage.data || '[]');

const currentUser = {};

let usersOnlineArr = [];
let messageCount;


const socket = new WebSocket('ws://localhost:3000');


socket.addEventListener('open', function (e) {

});

socket.addEventListener('close', function () {
	socket.send(JSON.stringify(currentUser));
});

socket.addEventListener('message', function (e) {


	const users = JSON.parse(e.data);
	if (users.type == 'getAllUsers') {

		if (currentUser.type == 'userSavePhoto') {

			const usersPhoto = document.querySelectorAll('.participant__ava');

			for (let userPhoto of usersPhoto) {
				console.log(userPhoto);

			}
		}


		usersOnlineArr = [];

		const onlineUsers = users.users;

		for (key in onlineUsers) {

			usersOnlineArr.push(onlineUsers[key]);

			let usersItem = '';
			usersOnlineArr.forEach(function (user) {
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

		}

	} else {

		addMessage(e.data);

	}
});

errorBtn.addEventListener('click', function () {

	closeFade(blockError);
});

(function autorize() {
	const app = document.querySelector('.app');
	const autorizeBlock = document.querySelector('.authorisation');
	const inputName = document.querySelector('#authorisation-name');
	const inputNick = document.querySelector('#authorisation-nick');
	const enterBtn = document.querySelector('.authorisation__enter');

	enterBtn.addEventListener('click', function () {


		for (let user of users) {

			if (inputName.value != user.name && inputNick.value === user.nick) {

				titleError.textContent = "Пользователь с таким ником уже существует";
				OpenFade(blockError);
				throw new Error('nick exists')
			}
		}



		if (inputName.value.length < 3 || inputNick.value.length < 3) {

			titleError.textContent = "Поля должны содержать не менее 3 символов";
			OpenFade(blockError);

		} else {
			currentUser.name = inputName.value;
			currentUser.nick = inputNick.value;
			currentUser.type = 'userInfo';
			currentUser.lastMes = '';
			currentUser.img = '';

			socket.send(JSON.stringify(currentUser));
			users.push(currentUser);
			storage.data = JSON.stringify(users);
			//			storage.data = '';

			inputName.value = '';
			inputNick.value = '';


			autorizeBlock.style.display = 'none';

			OpenFade(app);
		}

	});

})();

function addUserToAside(mes) {

	//
	//	const usersList = document.querySelector('.participant');
	//
	//	const userItem = document.createElement('li');
	//	const userName = document.createElement('h3');
	//	userItem.classList.add('participant__item');
	//	userName.classList.add('participant__name');
	//
	//
	//	userName.textContent = mes;
	//	userItem.appendChild(userName);
	//	usersList.appendChild(userItem);
	//	//	}

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
}

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
		const chatAva = document.querySelector(`#chatava${currentUser.nick}`);

		photoSend = loaduserPhoto.getAttribute('src');
		currentUser.img = photoSend;
		currentUser.type = 'userSavePhoto';

		socket.send(JSON.stringify(currentUser));
		currentAva.setAttribute('src', currentUser.img);

		if (chatAva) {
			chatAva.setAttribute('src', currentUser.img);
		}
		closeFade(modalLoad);
	})
})();

function addMessage(mes) {
	
	const date = new Date();
	let hour = date.getHours();
	let minutes = date.getMinutes();
	let currentDate = `${hour}:${minutes}`

	messageCount = 0;

	const firstMesTemplate = `<li class="chat__mes-item">
                <div class="chat__ava-wrap"><img class="chat__ava" src="${currentUser.img}" id="chatava${currentUser.nick}"></div>
                <ul class="chat__messages">   
				<li class="chat__message">
				<span class="chat__text"> ${mes}</span>
				<span class="chat__date"> ${currentDate} </span> </li>
				</ul> </li>`;
	const otherMesTemplate = `<span class="chat__text"> ${mes}</span>
				<span class="chat__date"> ${currentDate} </span> `
	const ChatList = document.querySelector('.chat__mes-list');

	if (messageCount == 0) {
		ChatList.innerHTML = firstMesTemplate;
	} else {
		const messages = document.querySelector('.chat__messages');
	const liMes = document.createElement('li');
	liMes.classList.add('chat__message');
	liMes.innerHTML = mesTemplate;

	messages.appendChild(liMes);
	}
	
{
	//	const date = new Date();
	//	let hour = date.getHours();
	//	let minutes = date.getMinutes();
	//	let currentDate = `${hour}:${minutes}`
	//	let mesItemTempate;
	//	let mesTempate;
	//
	//	mesTemplate = `<span class="chat__text"> ${mes}</span>
	//<span class="chat__date"> ${currentDate} </span> `
	//	mesItemTemplate = ` <li class="chat__mes-item">
	//                <div class="chat__ava-wrap"><img class="chat__ava" src="${currentUser.img}" id="chatava${currentUser.nick}"></div>
	//                <ul class="chat__messages">    
	//
	//</ul> </li>`
	//
	//	ChatList.innerHTML = mesItemTemplate;
	//
	//	const messages = document.querySelector('.chat__messages');
	//	const liMes = document.createElement('li');
	//	liMes.classList.add('chat__message');
	//	liMes.innerHTML = mesTemplate;
	//
	//	messages.appendChild(liMes);
}	

};

(function sendMessage() {
	const inputMes = document.querySelector('.chat__input');
	const inputform = document.querySelector('.chat__form');
	const btnSend = document.querySelector('.chat__send-btn');



	btnSend.addEventListener('click', function (e) {
		e.preventDefault();
		const lastMessage = document.querySelector(`#lastmessage${currentUser.nick}`)

		currentUser.type = 'sendMessage';
		currentUser.lastMes = inputMes.value;

		lastMessage.textContent = currentUser.lastMes;

		socket.send(currentUser.lastMes);

		inputMes.value = '';
		messageCount++;
		console.log(messageCount)
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
	//		modal.style.opacity = 1;

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
