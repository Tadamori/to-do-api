var express = require('express');
var _ = require('underscore');
var bodyParser = require('body-parser');

//это метод heroku, чтобы установить нужный порт
var PORT = process.env.PORT || 3000;
var app = express();
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

// создаем стартовую страницу
app.get('/', function (req, res) {
	res.send('<h1>ToDo API Root</h1>');
});

// список всех туду
app.get('/todos', function (req, res) {
	res.json(todos);
});

// конкретное туду по айди
app.get('/todos/:id', function (req, res) { // нужно чтобы было именно :id 
	var todoId = parseInt(req.params.id, 10); // присваиваем переменной значение которое пользователь ввел в строку и преображаем в число
	var matchedTodo = _.findWhere(todos, {id: todoId}); // хранилище для совпадения findWhere это функция underscore

	if (matchedTodo) { // если нашли, то отправляем респонс
		res.json(matchedTodo);
	} else {
		res.status(404).send(); // если нет, то отправляем 404
	}
});

// разместить новое туду
app.post('/todos', function (req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).send();
	}

	body.description = body.description.trim();

	body.id = todoNextId;
	todoNextId++;
	todos.push(body);

	res.json(body);
});

// удалить туду
app.delete('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});

	if (!matchedTodo) {
		res.status(400).json({"error": "no todo found with that id"});
	} else {
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);	
	}
});

// изменить существующее туду
app.put('/todos/:id', function (req, res) {
	var body = _.pick(req.body, 'description', 'completed');
	var validAttributes = {};
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});

	if (!matchedTodo) {
		res.status(400).json({"error": "no todo found with that id"});
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).send();
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	}

	_.extend(matchedTodo, validAttributes);
	res.send(matchedTodo);
});

app.listen(PORT, function () {
	console.log('Express listening on port ' + PORT + '!');
});	