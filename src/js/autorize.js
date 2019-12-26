//const wrapper = document.querySelector('.wrapper');
//const autorizeBlock = document.querySelector('.authorisation');
//const inputName = document.querySelector('#authorisation-name');
//const inputNick = document.querySelector('#authorisation-nick');
//const enterBtn = document.querySelector('.authorisation__enter');
//const blockError = document.querySelector('.error');
//const errorBtn = document.querySelector('.error__btn');
//
//const currentUser = {};
//const users = [];
//
//enterBtn.addEventListener('click', function () {
//	if (inputName.value <= 3 || inputNick.value <= 3) {
//
//		blockError.style.display='flex';
//	
//	} else {
//		currentUser.name = inputName.value;
//		currentUser.nick = inputNick.value;
//		currentUser.id = Math.random().toString(36).substr(2, 9);
//
//		const clone = {};
//
//		for (let key in currentUser) {
//			clone[key] = currentUser[key];
//		}
//		users.push(clone);
//		console.log(users);
//		
//	}
//
//});
//
//
//errorBtn.addEventListener('click', function() {
//	blockError.style.display='none';
//})