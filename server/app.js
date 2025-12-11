const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo';

async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Успешно подключено к MongoDB');
  } catch (error) {
    console.error('Ошибка подключения к MongoDB:', error.message);
    console.log('Повторная попытка через 5 секунд...');
    setTimeout(connectToMongoDB, 5000);
  }
}

mongoose.connection.on('error', (err) => {
  console.error('Ошибка MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB отключен. Переподключение...');
  connectToMongoDB();
});

connectToMongoDB();

const todoSchema = new mongoose.Schema({
  title: String,
  description: String,
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Todo = mongoose.model('Todo', todoSchema);

app.get('/health', (req, res) => {
  const status = mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy';
  res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({
    status,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/todos', async (req, res) => {
  try {
    const todo = new Todo(req.body);
    const savedTodo = await todo.save();
    res.status(201).json(savedTodo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Задача не найдена' });
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!todo) return res.status(404).json({ error: 'Задача не найдена' });
    res.json(todo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Задача не найдена' });
    res.json({ message: 'Задача удалена' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Подключение к MongoDB: ${MONGODB_URI}`);
});