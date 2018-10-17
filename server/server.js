var express = require('express');
var bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');


var {mongoose} = require('./db/mongoose.js');
var {Todo} = require('./models/todo.js');
var {User} = require('./models/user.js');

var app = express();	
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
	var todo = new Todo({
		text: req.body.text
	});
	todo.save().then((
		doc) => {
		res.send(doc);
	},(e) => {
		res.status(400).send(e);
	});
});

app.get('/todos', (req, res) => {
	Todo.find().then((todos) => {
		res.send({todos})
	}, (e) => {
		res.status(400).send(e);
	})
});


app.get('/todos/:id', (req, res) => {
	var id = req.params.id
	if (!ObjectID.isValid(id)) {
	  return res.status(404).send('invalid ID');
	}
	Todo.findById(id).then((todo) => {
	  if (!todo) {
	    return res.status(404).send('Id not found');
	  }
	  res.status(200).send({todo});
	}).catch((e) => console.log(e));

});

app.listen(3000, () => {
	console.log(`started listening on ${port}`);
});

module.exports = {
	app
};