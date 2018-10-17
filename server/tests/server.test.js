const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos =[{
	_id: new ObjectID(),
	text: 'First todo item'
}, {
	_id: new ObjectID(),
	text: 'Second todo item'
}];

beforeEach((done) => {
	Todo.remove({}).then(() => {
		return Todo.insertMany(todos);
		
	}).then(done());
}); 

describe('POST /todos', () => {
	it('should create a new todo', (done) => {
		var text = 'a new test todo';

		request(app)
			.post('/todos')
			.send({text})
			.expect(200)
			.expect((res) => {
				expect(res.body.text).toBe(text);
			})
			.end((err, res) => {
				if(err) {
					return done(err);
				}

				Todo.find({text}).then((todos) => {
					expect(todos.length).toBe(1);
					expect(todos[0].text).toBe(text);
					done();
				}).catch((e) => done(e));
			});
	});

	it('should not create todo with invalid body data', (done) => {
		request(app)
			.post('/todos')
			.send({})
			.expect(400)
			.end((err, res) => {
				if(err) {
					return done(err);
				}

				Todo.find().then((todos) => {
					expect(todos.length).toBe(2)
					done();
				}).catch((e) => done(e));
			});
	});
});

describe('/GET todos', () => {
	it('should get all todos', (done) => {
		request(app)
			.get('/todos')
			.expect(200)
			.expect((res) => {
				expect(res.body.todos.length).toBe(2)
			})
			.end(done);
	});
});

describe('/GET /todos/:id', () => {
	it('should return the todo with the specified id', (done) => {
		request(app)
			.get(`/todos/${todos[0]._id.toHexString()}`)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe(todos[0].text);
			})
			.end(done);
	});
	it('should return 404 when non existing id is given', (done) => {
		id = new ObjectID();
		request(app)
			.get(`/todos/${id.toHexString()}`)
			.expect(404)
			.end(done);
	});
	it('should return 404 when invalid id is given', (done) => {
		id = '5bc6ff6611206ca13509133334'
		request(app)
			.get(`/todos/${id}`)
			.expect(404)
			.end(done);
	});
});

describe('/DELETE /todos/:id', () => {
	it('should remove a todo', (done) => {
		request(app)
			.delete(`/todos/${todos[0]._id.toHexString()}`)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe(todos[0].text);
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				Todo.findById(todos[0]._id.toHexString()).then((todo) => {
					expect(todo).toNotExist();
					done();
				}).catch((e) => done(e));
			});
	});

	it('should return 404 if todo not found', (done) => {
		id = new ObjectID();
		request(app)
			.delete(`/todos/${id.toHexString()}`)
			.expect(404)
			.end(done);
	});

	it('should return 404 if object ID is invalid', (done) => {
		id = '5bc6ff6611206ca13509133334';
		request(app)
			.delete(`/todos/${id}`)
			.expect(404)
			.end(done);
	});
});

