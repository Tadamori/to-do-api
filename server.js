var express = require('express');
var _ = require('underscore');
var bodyParser = require('body-parser');
var db = require('./db.js');
var bcrypt = require('bcrypt');

//это метод heroku, чтобы установить нужный порт
var PORT = process.env.PORT || 3000;
var app = express();
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

// создаем стартовую страницу
app.get('/', function(req, res) {
	res.send('<h1>ToDo API Root</h1>');
});

// список всех туду
app.get('/todos', function(req, res) {
	var query = req.query; // получаем доступ к квери которые ввел пользователь
	var where = {};

	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}

	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like: '%' + query.q + '%'
		};
	}

	db.todo.findAll({
		where: where
	}).then(function(todos) {
		res.json(todos);
	}, function(e) {
		res.status(500).send();
	});

	// var filteredTodos = todos;

	// if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
	// 	filteredTodos = _.where(filteredTodos, {
	// 		completed: true
	// 	});
	// } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
	// 	filteredTodos = _.where(filteredTodos, {
	// 		completed: false
	// 	});
	// }

	// if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
	// 	filteredTodos = _.filter(filteredTodos, function(todo) {
	// 		return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
	// 	});
	// }

	// res.json(filteredTodos);
});

// конкретное туду по айди
app.get('/todos/:id', function(req, res) { // нужно чтобы было именно :id 
	var todoId = parseInt(req.params.id, 10); // присваиваем переменной значение которое пользователь ввел в строку и преображаем в число

	db.todo.findById(todoId).then(function(todo) {
		if (todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).send();
	});


	// var matchedTodo = _.findWhere(todos, {
	// 	id: todoId
	// }); // хранилище для совпадения findWhere это функция underscore

	// if (matchedTodo) { // если нашли, то отправляем респонс
	// 	res.json(matchedTodo);
	// } else {
	// 	res.status(404).send(); // если нет, то отправляем 404
	// }
});

// разместить новое туду
app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then(function(todo) {
		res.json(todo.toJSON());
	}, function(e) {
		res.status(400).json(e);
	});

	// if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
	// 	return res.status(400).send();
	// }

	// body.description = body.description.trim();

	// body.id = todoNextId;
	// todoNextId++;
	// todos.push(body);

	// res.json(body);
});

// удалить туду
app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.destroy({
		where: {
			id: todoId
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).json({
				error: "No todo with id"
			});
		} else {
			res.status(204).send().json; //204 - все прошло хорошо, но нечего возвращать
		}
	}, function(e) {
		res.status(500).send();
	});
	// var matchedTodo = _.findWhere(todos, {
	// 	id: todoId
	// });

	// if (!matchedTodo) {
	// 	res.status(400).json({
	// 		"error": "no todo found with that id"
	// 	});
	// } else {
	// 	todos = _.without(todos, matchedTodo);
	// 	res.json(matchedTodo);
	// }
});

// изменить существующее туду
app.put('/todos/:id', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};
	var todoId = parseInt(req.params.id, 10);
	// var matchedTodo = _.findWhere(todos, {
	// 	id: todoId
	// });

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	db.todo.findById(todoId).then(function(todo) {
		if (todo) {
			todo.update(attributes).then(function(todo) {
				res.json(todo.toJSON());
			}, function(e) {
				res.status(400).json(e); // 400 гворит о том что был введен не правильный синтаксис
			});
		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(500).send();
	});


	// if (!matchedTodo) {
	// 	res.status(400).json({
	// 		"error": "no todo found with that id"
	// 	});
	// }
	// if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
	// 	validAttributes.completed = body.completed;
	// } else if (body.hasOwnProperty('completed')) {
	// 	return res.status(400).send();
	// }
	// if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
	// 	validAttributes.description = body.description;
	// } else if (body.hasOwnProperty('description')) {
	// 	return res.status(400).send();
	// }
	// _.extend(matchedTodo, validAttributes); // по неведомой мне причине это реально обоновляет код в массиве todos
	// res.send(matchedTodo);
});


//************************** USER API *********************************************//

app.post('/users', function (req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then( function (user) {
		res.json(user.toPublicJSON());
	}, function (e) {
		res.status(400).json(e);
	});
});

app.post('/users/login', function (req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.isValid(body).then(function(user) {
		res.json(user.toPublicJSON());
	}, function(e) {
		res.status(401).send();
	});
		
});


db.sequelize.sync({force: true}).then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!');
	});
});