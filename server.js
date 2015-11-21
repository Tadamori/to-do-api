var express = require('express');
var app = express();
//это метод heroku, чтобы установить нужный порт
var PORT = process.env.PORT || 3000;
var todos = [{
	id: 1,
	description: 'Go for for lunch',
	completed: false,
}, {
	id: 2,
	description: 'Buy game', 
	completed: false
}, {
	id: 3,
	description: 'Study node.js',
	completed: true
}];

app.get('/', function (req, res) {
	res.send('<h1>ToDo API Root</h1>');
});

app.get('/todos', function (req, res) {
	res.json(todos);
});

app.get('/todos/:id', function (req, res) { // нужно чтобы было именно :id 
	var todoId = parseInt(req.params.id, 10); // присваиваем переменной значение которое пользователь ввел в строку и преображаем в число
	var matchedTodo; // хранилище для совпадения

	todos.forEach(function (todo) { // ищем совпадение 
		if (todo.id === todoId) {
			matchedTodo = todo;
		}
	});

	if (matchedTodo) { // если нашли, то отправляем респонс
		res.json(matchedTodo);
	} else {
		res.status(404).send(); // если нет, то отправляем 404
	}
});

app.listen(PORT, function () {
	console.log('Express listening on port ' + PORT + '!');
});	