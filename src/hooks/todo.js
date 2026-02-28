import { useEffect, useState } from 'react';
import { api } from '../api';


export function useTodos() {
  const [todos, setTodos] = useState([]);
  const [errorMessage, setErrorMessage] = useState();
  const [isLoading, setIsLoading] = useState(false);

  async function fetchTodos() {
    setIsLoading(true);
    try {
      const data = await api.todos.getAll(filters)
      setTodos(data)
    } catch (error) {
      setErrorMessage("Failed to get todo's, Please try again");
    } finally {
      setIsLoading(false);
    }
  }


  const [filters, setFilters] = useState({ completed: "", priority: "" })
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.body.classList.toggle("dark-mode", savedTheme === "dark");
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [filters]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);

    // Toggle a class on the body
    document.body.classList.toggle("dark-mode", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  }

  async function handleCreate(newTodo) {
    setIsLoading(true);
    try {
      await api.todos.create(newTodo)
      await fetchTodos()
    } catch (error) {
      setErrorMessage("Failed to create todo, Please try again later.")
    } finally {
      setIsLoading(false);
    }
  }

  function mergeTodoLogic(todo, changes) {
    let merged = { ...todo, ...changes };

    if (changes.status) {
      if (changes.status === "Completed") {
        merged.completed = true;
        merged.previousStatus =
          todo.status !== "Completed" ? todo.status : todo.previousStatus;
      } else {
        merged.completed = false;
        merged.previousStatus = changes.status;
      }
    }

    if ("completed" in changes && !("status" in changes)) {
      if (changes.completed) {
        merged.previousStatus =
          todo.status !== "Completed" ? todo.status : todo.previousStatus;
        merged.status = "Completed";
      } else {
        merged.status = todo.previousStatus || "Not-Started";
      }
    }

    return merged;
  }

  async function handleUpdate(id, changes) {
    setIsLoading(true);
    // Merge locally for optimistic UI
    setTodos((prevTodos) =>
      prevTodos.map((todo) => {
        if (todo.id !== id) return todo;
        return mergeTodoLogic(todo, changes);
      })
    );

    // Find the updated todo object
    try {
      const updatedTodo = todos.find((t) => t.id === id);
      const mergedTodo = mergeTodoLogic(updatedTodo, changes);

      const serverTodo = await api.todos.update(id, mergedTodo);

      setTodos(prevTodos =>
        prevTodos.map(t => (t.id === id ? serverTodo : t))
      );
    } catch (error) {
      setErrorMessage("Error updating todo:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id) {
    setIsLoading(true);
    try {
      await api.todos.delete(id)
      await fetchTodos();
    } catch (error) {
      setErrorMessage("Failed to delete todo, Please try again");
    } finally {
      setIsLoading(false);
    }

  }

  return {
    isLoading,
    data: todos,
    fetch: fetchTodos,
    filter: setFilters,
    create: handleCreate,
    update: handleUpdate,
    delete: handleDelete,
    error: {
      message: errorMessage,
      clear: () => setErrorMessage(""),
    },
    theme,
    toggleTheme,
  }
}