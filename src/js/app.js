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
      
        authForm.addEventListener('submit', function (e) {

            e.preventDefault();

            currentUser.name = inputName.value;
            currentUser.nick = inputNick.value;
            currentUser.type = 'userInfo';
            currentUser.lastMes = '';
            currentUser.img = '';

            for (let user of users) {
                if (inputName.value != user.name && inputNick.value === user.nick) {
                    titleError.textContent = 'Пользователь с таким ником уже существует';
                    openFade(blockError);
                    throw new Error('nick exists')
                } else if (inputName.value == user.name && inputNick.value === user.nick) {
                    currentUser = user;
                }
            }

            if (inputName.value.length < 3 || inputNick.value.length < 3) {
                titleError.textContent = 'Поля должны содержать не менее 3 символов';
                openFade(blockError);
            } else {

                users.push(currentUser);
                storage.data = JSON.stringify(users);
                // storage.data = '';

                inputName.value = '';
                inputNick.value = '';

                autorizeBlock.style.display = 'none';
                openFade(app);
                init = true;
                if (init === true) {
                    socket.send(JSON.stringify(currentUser));
                }

                init = false;
            }
        });
    })();   

    socket.addEventListener('close', function () {
        socket.send(JSON.stringify(currentUser));
        // init = false;
    });

    socket.addEventListener('error', function () {
        socket.send(JSON.stringify(currentUser));
        // init = false;
    });

    socket.addEventListener('message', function (e) {

        const users = JSON.parse(e.data);

        function initPhoto() {
            const asideAva = document.querySelector(`#asideAva${currentUser.nick}`);

            for (let key in users.users) {
                if (currentUser.nick === users.users[key].nick) {

                    if (asideAva) {
                        asideAva.setAttribute('src', `${users.users[key].img}`);
                    }
                }
            }
        }
        if (users.type == 'getAllUsers') {

            // function inizialize() {
            usersOnlineArr = [];

            const onlineUsers = users.users;

            for (let key in onlineUsers) {
                if (onlineUsers) {
                    usersOnlineArr.push(onlineUsers[key]);

                    let usersItem = '';

                    usersOnlineArr.forEach(function (user) {

                        if (currentUser.nick === user.nick) {
                            user = currentUser;
                        }
                        usersItem += `<li class="participant__item">
                  <div class="participant__ava-wrap">
                    <img class="participant__ava" src="${user.img}" id="asideAva${user.nick}">
                    </div>
                  <div class="participant__info">
                    <h3 class="participant__name"> ${user.name}</h3>
                    <div class="participant_mes" id="lastmessage${user.nick}"> ${user.lastMes} </div>
                  </div>
                </li>`
                    });

                    usersList.innerHTML = usersItem;
                    usersOnlineCount();
                    initPhoto();
                    initLastMessage();
                }
            }

            if (currentUser.type == 'userSavePhoto') {
                initPhoto();
            }

        } else {

            addMes(users.lastMes, users.img, users.nick);
            initChatAva();
            initLastMessage();
            initActiveMessage();
        }
    });

    function addMes(mes, img, nick) {

        const ChatList = document.querySelector('.chat__mes-list');

        const date = new Date();
        let hour = date.getHours();
        let minutes = date.getMinutes();
        let currentDate = `${hour}:${minutes}`;

        const mesTemplate = `
                    <div class="chat__ava-wrap"><img class="chat__ava" src="${img}" id="chatAva${nick}" ></div>
                  
                    <div class="chat__message">
                    <span class="chat__text"> ${mes}</span>
                    <span class="chat__date"> ${currentDate} </span> </div>`;
        const liMes = document.createElement('li');

        liMes.classList.add('chat__messages');
        liMes.classList.add(`liMes${nick}`);
        liMes.innerHTML = mesTemplate;

        ChatList.appendChild(liMes);
    }

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
            openFade(photoModal);
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
            openFade(modalLoad);

            const file = e.target.files[0];

            if (file) {
                if (file.size > 512 * 1024) {
                    openFade(blockError);
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
 
            photoSend = loaduserPhoto.getAttribute('src');
            currentUser.img = photoSend;
            currentUser.type = 'userSavePhoto';

            socket.send(JSON.stringify(currentUser));
            currentAva.setAttribute('src', currentUser.img);
            initChatAva();

            closeFade(modalLoad);
        })
    })();

    (function sendMessage() {
        const inputMes = document.querySelector('.chat__input');
        const btnSend = document.querySelector('.chat__send-btn');

        btnSend.addEventListener('click', function (e) {
            e.preventDefault();

            for (let user of usersOnlineArr) {
                if (user.nick === currentUser.nick) {
                    currentUser = user
                }
            }
            currentUser.type = 'sendMessage';
            currentUser.lastMes = inputMes.value;

            socket.send(JSON.stringify(currentUser));

            inputMes.value = '';
            initLastMessage();
        });

    })();

    function initChatAva() {
        const thisAvas = document.querySelectorAll('.chat__ava');
        let avaID;

        if (thisAvas.length > 1) {
            thisAvas.forEach(ava => {
                avaID = ava.getAttribute('id');
                for (let user of usersOnlineArr) {
                    if (avaID == `chatAva${user.nick}`) {
                        ava.setAttribute('src', user.img)
                    }
                }
            });
        }

        if (thisAvas.length === 1) {
            avaID = thisAvas[0].getAttribute('id');
            for (let user of usersOnlineArr) {
                if (avaID == `chatAva${user.nick}`) {
                    thisAvas[0].setAttribute('src', user.img)
                }
            }
        }
    }

    function initLastMessage() {
        const lastMessages = document.querySelectorAll('.participant_mes');

        let msgID;

        if (lastMessages.length > 1) {
            lastMessages.forEach(mes => {
                msgID = mes.getAttribute('id');

                usersOnlineArr.forEach( user => {
                    if (msgID == `lastmessage${user.nick}`) {
                        mes.textContent = user.lastMes
                    }
                })
            });
        }
        if (lastMessages.length === 1) {
            msgID = lastMessages[0].getAttribute('id');

            for (let user of usersOnlineArr) {
                if (msgID == `lastmessage${user.nick}`) {
                    lastMessages[0].textContent = user.lastMes
                }
            }
        }

    }
    
    function initActiveMessage() {
        const messagesItem = document.querySelectorAll('.chat__messages');
        
        if (messagesItem.length > 1) {
            messagesItem.forEach(messageItem => {
        
                if (messageItem.classList.contains(`liMes${currentUser.nick}`)) {
                    messageItem.classList.add('active')
                }
            });
            
        }
        
        if (messagesItem.length === 1) {
            if (messagesItem[0].classList.contains(`liMes${currentUser.nick}`)) {
                messagesItem[0].classList.add('active')
            }
        }        
    }

    function openFade(modal) {
        let opOpen = 0;

        modal.style.display = 'flex';
        modal.style.opacity = opOpen;

        setTimeout(function fadeIn() {
            opOpen += 0.1;
            if (opOpen < 1) {

                modal.style.opacity = opOpen;
            }
            setTimeout(fadeIn, 50);
        }, 300);

    }

    function closeFade(modal) {
        let opClose = 1;

        setTimeout(function fadeOut() {
            opClose -= 0.1;
            if (opClose > 0) {
                modal.style.opacity = opClose;
                setTimeout(fadeOut, 50);

            } else {
                modal.style.display = 'none';
            }
        }, 300);
    }
})();
