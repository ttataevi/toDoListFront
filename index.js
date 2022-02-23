let numberOfelems = 0;
const NUM = 5;
let currPage = 1;

const enterClicked = (e) => {
	if (e.code === 'Enter') {
		addNewElem();
	}
}

window.onload = function () {
	document.addEventListener('keypress', enterClicked);
}

axios.get('http://127.0.0.1:5000/').then((response) => {
	response.data.forEach(x => {
		numberOfelems++;
	})

	renderPagination();
	document.getElementById('pagination1').click();
});


const renderPagination = () => {
	console.log('---------renderPagination');
	for (let i = 1; i <= numberOfelems; i++) {
		document.getElementById('forButtons').innerHTML = '';
		let num = Math.ceil(numberOfelems / NUM) === 0 ? 1 : Math.ceil(numberOfelems / NUM);
		for (let i = 1; i <= num; i++) {
			let newBut = document.createElement('button');
			newBut.innerHTML = i;
			newBut.id = 'pagination' + i;

			newBut.addEventListener('click', () => getPaginationItems(i));
			document.getElementById('forButtons').append(newBut);
		}

	}
};

const getPaginationItems = i => {
	currPage = i;
	document.getElementById('forElems').innerHTML = '';
	axios.post('http://127.0.0.1:5000/pagination', {
		'index': i
	}).then((response) => {
		document.getElementById('forElems').innerHTML = '';

		response.data.forEach(x => {
			addElems(x.id, x.name, x.done, document.getElementById('forElems'));
		})
	});
};

const addNewElem = () => {
	numberOfelems++;
	let text = document.getElementById('taskName').value;
	if (document.getElementById('taskName').value.trim()) {
		axios.post('http://127.0.0.1:5000/add', {
			'name': text
		}).then((response) => {
			addElems(response.data.answer, text, false, document.getElementById('forElems'));
		});
	} else {
		alert('Text is empty!')
	}
	document.getElementById('taskName').value = '';
}

const addElems = (id, text, checking, doc) => {
	if (doc.childNodes.length === 5) {
		doc.innerHTML = "";
		renderPagination();
		currPage++;
	}

	// create div
	let div = document.createElement('div');
	doc.append(div);
	div.id = id;
	div.classList.add('container');
	//create checkbox and add onclick method
	let check = document.createElement('input');
	check.type = 'checkbox';
	check.checked = checking;

	//create label for task
	let lbl = document.createElement('label');
	lbl.innerHTML = text;
	lbl.classList.add('col-sm-2');


	check.onclick = () => {
		document.getElementById(id).querySelector('div > label').classList.remove(check.checked ? 'basic' : 'line');
		document.getElementById(id).querySelector('div > label').classList.add(!check.checked ? 'basic' : 'line');
		axios.post('http://127.0.0.1:5000/check', {
			'id': id,
			'check': document.getElementById(id).querySelector('div > input').checked,
		});
	}

	// create delete button for task and add onClick function
	let btn = document.createElement('button');
	btn.innerHTML = 'delete';
	btn.classList.add('deleteButton')
	btn.classList.add('btn-secondary');

	div.append(check)
	div.append(lbl)
	div.append(btn);

	if (checking) {
		document.getElementById(id).querySelector('div > label').classList.add('line');
	}

	btn.onclick = () => {
		numberOfelems--;
		if (document.getElementById('forElems').children.length - 1 === 0) {
			currPage = numberOfelems !== 0 ? numberOfelems / NUM : 1;
		}

		axios.post('http://127.0.0.1:5000/delete', {
			'id': id
		})
			.then(() => {
				document.getElementById('forElems').removeChild(document.getElementById(id))
				renderPagination();
				document.getElementById("pagination" + currPage).click();
			});

	};

	let editBtn = document.createElement('button');
	editBtn.innerHTML = 'edit';
	editBtn.classList.add('editButton');
	editBtn.classList.add('btn-success');
	div.append(editBtn);

	editBtn.onclick = () => {

		// get div and it's inside elements
		let myDiv = document.getElementById(id);
		let textElement = document.getElementById(id).querySelector('div  > label');
		let deleteButton = document.getElementById(id).querySelector('.deleteButton');
		let editButton = document.getElementById(id).querySelector('.editButton');

		// hide those elements
		textElement.classList.add('hidden');
		deleteButton.classList.add('hidden');
		editButton.classList.add('hidden');
		check.classList.add('hidden');

		// text for change
		let toInsert = document.createElement('input');
		toInsert.value = lbl.textContent;
		toInsert.size = lbl.textContent.length;

		let toEdit = document.createElement('button');
		toEdit.innerHTML = 'save';
		toEdit.classList.add('saveButton');
		toEdit.classList.add('btn-success');


		let notEdit = document.createElement('button');
		notEdit.innerHTML = 'cancel';
		notEdit.classList.add('cancelButton');
		notEdit.classList.add('btn-warning');

		myDiv.prepend(notEdit);
		myDiv.prepend(toEdit);
		myDiv.prepend(toInsert);

		notEdit.onclick = () => clearEdit();

		const clearEdit = () => {
			myDiv.removeChild(toEdit);
			myDiv.removeChild(notEdit);
			myDiv.removeChild(toInsert);

			textElement.classList.remove('hidden');
			deleteButton.classList.remove('hidden');
			editButton.classList.remove('hidden');
			check.classList.remove('hidden')
		}

		toEdit.onclick = () => {
			let newText = toInsert.value;
			newText = newText.trim();
			if (newText.trim()) {
				axios.post('http://127.0.0.1:5000/change', {
					'id': id,
					'edit': newText,
					'check': check.checked
				});
				document.getElementById(id).querySelector('div > label').innerHTML = newText;
			} else {
				alert('Text is empty!')
			}
			clearEdit();
		}
	}
}


