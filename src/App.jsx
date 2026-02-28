import { TodoForm } from './Components/ToDo/TodoForm'
import { useTodos } from './hooks/todo';
import styles from './App.module.css';
import { Alert } from './Components/Alert/Alert';
import { Loader } from './Components/Loader/Loader';
import { TodoList } from './Components/ToDoForm/TodoList/TodoList';
import { ToDoFilters } from './Components/ToDoFilters/ToDoFilters';
import todoLogo from "./assets/to-do-list.png";

function App() {
  const todos=useTodos()

  return (
    <div className={`${styles.App} ${styles[todos.theme]}}`}>
      
      <header className={styles.Header}>
        <img className={styles.Logo} src={todoLogo} alt="ToDo Logo"
        />
        <span>
          <h2 className={styles.Title}>To-Do App</h2>

          <button onClick={todos.toggleTheme}>
            {todos.theme === "light" ? "Switch to 🌑Dark Mode" : "Switch to ☀️Light Mode"}


          </button>
        </span>
      </header>

      <div className={styles.AppContainer}>
        {todos.isLoading && <Loader theme={todos.theme}/>}
        {!!todos.error.message &&(
          <Alert onClear={todos.error.clear}>{todos.error.message}</Alert>
        )}
        <TodoForm onCreate={todos.create} />
        <ToDoFilters onFilter={todos.filter} todos={todos.data} />
        <TodoList todos={todos.data} onUpdate={todos.update} onDelete={todos.delete} />
      </div>
    </div>
  )
}

export default App
