var express = require('express');
app = express();
//это метод heroku, чтобы установить нужный порт
var PORT = process.env.PORT || 3000;

app.get('/', function (req, res) {
	res.send('<h1>ToDo API Root</h1>');
});

app.listen(PORT, function () {
	console.log('Express listening on port ' + PORT + '!');
});