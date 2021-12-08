const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

// MIddleware to check if username is already registered
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find(user => user.username === username)

  if(!user) {
    return response.status(400).json({ error: 'User do not exists' })
  }
  
  request.user = user
  return next()
}

// Create new user
app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userAlreadyExists = users.some(user => user.username === username)
  if(userAlreadyExists) {
    return response.status(400).json({ error: 'User Already Exists' })
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(newUser)

  return response.status(201).json(newUser)
})

// Get a user's todos
app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  return response.json(user.todos)
})

// Create todo for a user
app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo)
})

// Update a user's todo
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request
  const { id: alteredTodoId } = request.params

  const todo = user.todos.find(todo => todo.id === alteredTodoId)

  if(!todo) {
    return response.status(404).json({ error: 'Todo not found' })
  }

  todo.title = title
  title.deadline = deadline

  return response.status(201).json(todo)
});

// Mark a todo as done
app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id: todoDoneId } = request.params

  const todo = user.todos.find(todo => todo.id === todoDoneId)

  if(!todo) {
    return response.status(404).json({ error: 'Todo not found' })
  }
  
  todo.done = true
  
  return response.json(todo)
});

// Delete a user's todo
app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id: removedTodoId } = request.params

  const todo = user.todos.find(todo => todo.id === removedTodoId)

  if(!todo) {
    return response.status(404).json({ error: 'Todo not found' })
  }

  user.todos.splice(todo, 1)

  return response.status(204).send()
});

module.exports = app;
