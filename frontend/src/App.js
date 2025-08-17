import React from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_TODOS = gql`
  query GetTodos {
    todos {
      id
      text
      completed
    }
  }
`;

// This mutation adds a new to-do item.
const ADD_TODO = gql`
  mutation AddTodo($text: String!) {
    addTodo(text: $text) {
      id
      text
      completed
    }
  }
`;

// This mutation toggles the 'completed' status of a to-do.
const TOGGLE_TODO = gql`
    mutation ToggleTodo($id: ID!) {
        toggleTodo(id: $id) {
            id
            text
            completed
        }
    }
`;

// This mutation removes a to-do item by its ID.
const REMOVE_TODO = gql`
    mutation RemoveTodo($id: ID!) {
        removeTodo(id: $id) {
            id
        }
    }
`;


function App() {
  const { loading, error, data } = useQuery(GET_TODOS);
  
  const [addTodo] = useMutation(ADD_TODO, {
    refetchQueries: [{ query: GET_TODOS }],
  });

  // useMutation hook for toggling a to-do.
  const [toggleTodo] = useMutation(TOGGLE_TODO);

  // useMutation hook for removing a to-do.
  const [removeTodo] = useMutation(REMOVE_TODO, {
    refetchQueries: [{ query: GET_TODOS }],
  });

  let input;

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '500px', margin: 'auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>My To-Do List</h2>
      <form
        style={{ display: 'flex', marginBottom: '20px' }}
        onSubmit={e => {
          e.preventDefault();
          if (!input.value.trim()) {
            return;
          }
          addTodo({ variables: { text: input.value } });
          input.value = '';
        }}
      >
        <input
          ref={node => {
            input = node;
          }}
          style={{ flexGrow: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          placeholder="What needs to be done?"
        />
        <button type="submit" style={{ padding: '10px 15px', marginLeft: '10px', border: 'none', background: '#007bff', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>
          Add Todo
        </button>
      </form>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {data && data.todos && data.todos.map(todo => (
          <li
            key={todo.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px',
              borderBottom: '1px solid #eee',
            }}
          >
            <span 
              onClick={() => toggleTodo({ variables: { id: todo.id } })}
              style={{
                flexGrow: 1,
                cursor: 'pointer',
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? '#888' : '#000',
              }}
            >
                {todo.text}
            </span>
            <button 
              onClick={() => removeTodo({ variables: { id: todo.id } })}
              style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '1.2em' }}
            >
                &times;
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;


