window.onload = function() {
	var startData = {
		"2766633421": ["₪", "Символ шекеля"],
		"3384766636": ["–", "Среднее тире"],
		"8827736625": ["¯\_(ツ)_/¯", "Пожималкин"], // '\' срабатывает как экранирование. Ну пиздец. (крит.баг #1)
		"3218363655": ["≠", "Не равно"]
	};
	get = {
		byId: function(id) {
			return document.getElementById(id);
		},
		byClass: function(className) {
			return document.getElementsByClassName(className);
		},
		byTag: function(tagname) {
			return document.getElementsByTagName(tagname);
		},
		storedSym: function() {
			chrome.storage.local.get("tTypo_stored_symbols", function(res) {
				return res.tTypo_stored_symbols;
			})
		},
		arrayToStore: function() {
			window.array = {};
			[].forEach.call(get.byClass('character'), function(res, i) {
				var symbol = res.getElementsByClassName('icon')[0].innerHTML,
					string = res.getElementsByClassName('description')[0].innerHTML;
				array[res.id] = [symbol, string];
			});
			return array;
		},
		randomId: function() {
			var max = 9999999999;
			var min = 999999999;
			return Math.floor(Math.random() * (max - min + 1)) + min;
		},
		eldbid: function(string) {
			return parseInt(string.match(/\d/ig).join('')); // вычленяет из любой строки только цифры
		}
	};
	set = {
		storedSymbols: function(array) {
			chrome.storage.local.set({"tTypo_stored_symbols": array});
		},
		clipboardValue: function(string) { // Обращаемся к функции внктри фоновой страницы
			chrome.runtime.getBackgroundPage(function(res) {
				res.setClipboardValue(string);
			});
		},
		localization: function(local) {
			{}; // Эта функция будет менять язык. Когда-нибудь.
		}
	},
	remove = {
		entry: function(id) {
			var parent = get.byClass('characters')[0],
				child = get.byId(id);
			parent.removeChild(child);
			chrome.storage.local.get("tTypo_stored_symbols", function(res) {
				var db = res.tTypo_stored_symbols; delete db[id];
				set.storedSymbols(db);
			})
		}
	};
	function init() {
		// set.storedSymbols(startData); // Пока нет функции записи в память, используем чучело
		chrome.storage.local.get("tTypo_stored_symbols", function(res) {
			var storedDb = res.tTypo_stored_symbols;
			if (storedDb == null) {
				storedDb = startData;
			} else {};
			// Это основной цикл, он заполняет DOM кнопками
			for (id in storedDb) {
				// Здесь легко запутаться.
				// Создаём котейнет для всей строки.
				if(get.byId(id) === null){ // Проверка на существование
					var character = document.createElement('div');
					character.className = ('character'); character.id = id;
					get.byClass('characters')[0].appendChild(character);
					// Создаём ячейку для иконки.
					var icon = document.createElement('div');
					icon.className = ('icon');
					icon.id = ('icon-' + id);
					icon.innerHTML = storedDb[id][0];
					if(storedDb[id][0].length > 2){ // Если содержимое ячейки – длинный текст
						icon.style.color = 'rgba(0, 0, 0, 0)';// то заменяем его на иконку
						icon.style.backgroundImage = 'url(/img/svg/text.svg)';
						icon.setAttribute('title', storedDb[id][0]);
					}
					get.byId(id).appendChild(icon);
					// Создаём поле для описания
					var description = document.createElement('div');
					description.className = 'description';
					description.innerHTML = storedDb[id][1];
					get.byId(id).appendChild(description);
					// Создаём кнопку редактирования (Она называется paste потому что хз)
					var paste = document.createElement('div');
					paste.className = 'paste';
					get.byId(id).appendChild(paste);
					// Создаём кнопку копирования
					var clipboardCopy = document.createElement('div');
					clipboardCopy.className = 'clipboard-copy';
					clipboardCopy.id = 'copy-' + id.toString()
					get.byId(id).appendChild(clipboardCopy);	
				} else {};
				// Если я всё сделал правильно, то это не повесит браузер
			};
		});
	};
	init();
	(function bindKeys() {
		document.body.onclick = function(e) {
			el = e.target;
			icon = get.byClass('add-icon')[0],
			syde = get.byClass('add-symbol-desc')[0],
			save = get.byClass('save')[0];
			switch(el.className){
				case 'icon': // Клик по иконке удаляет соответствующую запись
					var id = get.eldbid(el.id);
					remove.entry(id);
					break;
				case 'add-icon': // Позводяем пользователю ввести значение
					icon.setAttribute('contenteditable', 'true');
					icon.innerHTML = '';
					icon.focus();
					save.style.display = 'table-cell';
					break;
				case 'add-symbol-desc': 
					syde.setAttribute('contenteditable', 'true');
					syde.innerHTML = '';
					syde.focus();
					save.style.display = 'table-cell';
					break;
				case 'save': // Добавляем новую запись со случайно cгенерированным id
					chrome.storage.local.get("tTypo_stored_symbols", function(res) {
						var array = res.tTypo_stored_symbols;
						array[get.randomId()] = [get.byClass('add-icon')[0].textContent, get.byClass('add-symbol-desc')[0].textContent];
						set.storedSymbols(array);
						init();
					})
					break;
				case 'clipboard-copy': // Копируем нужный символ в буфер. Основа всего вообще
					var id = get.eldbid(el.id),
						content = get.byId('icon-' + id).innerHTML,
						box = get.byClass('top-desc')[0];
					set.clipboardValue(content);
					if(content.length <10){
						box.innerHTML = '\"' + content + '\" скопирован в буфер!';
					} else {
						box.innerHTML = 'Текст скопирован в буфер!';
					}
					setTimeout(function() {
						box.innerHTML = '';
					}, 2000)
					// window.close(); Свернуть попап. Будет настраиваться.
					break;
				case 'settings-button':
					get.byClass('settings-button')[0].setAttribute('class', 'close'); 
					get.byClass('settings')[0].style.display = 'block';
					break;
				case 'close':
					get.byClass('close')[0].setAttribute('class', 'settings-button');
					get.byClass('settings')[0].style.display = 'none';
					break;
				default:
					setTimeout(function() {
						icon.innerHTML = '+';
						syde.innerHTML = 'Щёлкните, чтобы добавить свой';
						save.style.display = 'none';
					}, 200)
					break;
			}
		}
	}).call(this);
}
