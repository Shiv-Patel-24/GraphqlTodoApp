const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const mongoose = require('mongoose');

const typeDefs = `#graphql
  type Todo {
    id: ID!
    text: String!
    completed: Boolean!
  }

  type Query {
    todos: [Todo]
  }

  type Mutation {
    addTodo(text: String!): Todo
    toggleTodo(id: ID!): Todo
    removeTodo(id: ID!): Todo
  }
`;

const Todo = mongoose.model('Todo', {
  text: String,
  completed: Boolean,
});

const resolvers = {
  Query: {
    // Resolver for the 'todos' query. It finds and returns all documents from the Todo collection.
    todos: async () => await Todo.find(),
  },
  Mutation: {
    // Resolver for the 'addTodo' mutation. Creates a new Todo item.
    addTodo: async (_, { text }) => {
      const todo = new Todo({ text, completed: false });
      await todo.save();
      return todo;
    },
    // Resolver for the 'toggleTodo' mutation. Finds a todo by ID and flips its 'completed' status.
    toggleTodo: async (_, { id }) => {
        const todo = await Todo.findById(id);
        if (!todo) {
            throw new Error('Todo not found');
        }
        todo.completed = !todo.completed;
        await todo.save();
        return todo;
    },
    // Resolver for the 'removeTodo' mutation. Finds a todo by ID and deletes it.
    removeTodo: async (_, { id }) => {
        // **FIXED**: Changed findByIdAndRemove to findByIdAndDelete
        const todo = await Todo.findByIdAndDelete(id);
        if (!todo) {
            throw new Error('Todo not found');
        }
        return todo;
    }
  },
};

async function startServer() {
    // Create a new Apollo Server instance.
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });

    await mongoose.connect('mongodb://localhost/graphql-todo', { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const { url } = await startStandaloneServer(server, {
        listen: { port: 4000 },
    });

    console.log(`Server ready at ${url}`);
}

startServer();