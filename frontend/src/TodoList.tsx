import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import type { Session } from '@supabase/supabase-js'
import ThemeToggle from './ThemeToggle';

// Define the type for a single task
type Task = {
  id: number;
  user_id: string;
  title: string;
  is_completed: boolean;
  inserted_at: string;
};

export default function TodoList({ session }: { session: Session }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel('public:tasks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${session.user.id}`, // Only listen to changes for the current user
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Use a callback with prevTasks to ensure you have the latest state
            setTasks((prevTasks) => [payload.new as Task, ...prevTasks]);
          }
          if (payload.eventType === 'UPDATE') {
            setTasks((prevTasks) =>
              prevTasks.map((task) =>
                task.id === payload.new.id ? (payload.new as Task) : task
              )
            );
          }
          if (payload.eventType === 'DELETE') {
            setTasks((prevTasks) =>
              prevTasks.filter((task) => task.id !== (payload.old as any).id)
            );
          }
        }
      )
      .subscribe();

    // Cleanup function to remove the channel subscription when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]); // Rerun effect if session changes

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const { user } = session
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('inserted_at', { ascending: false })

      if (error) throw error
      if (data) setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newTask.trim() === '') return;

    try {
      const { user } = session
      // No .select().single() needed anymore, realtime will handle the update
      const { error } = await supabase
        .from('tasks')
        .insert({ title: newTask, user_id: user.id })

      if (error) throw error
      setNewTask('') // Clear input field
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  const toggleTask = async (id: number, is_completed: boolean) => {
    try {
      // Optimistic update removed, realtime will handle it
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: !is_completed })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const deleteTask = async (id: number) => {
    try {
      // Optimistic update removed, realtime will handle it
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  return (
    <div className="todo-list-container">
      <div className="header-container">
        <h1>My To-Do List</h1>
        <ThemeToggle />
      </div>

      <form onSubmit={addTask} className="add-task-form">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button type="submit">Add Task</button>
      </form>

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <ul className="task-list">
          {tasks.map(task => (
            <li key={task.id} className={`task-item ${task.is_completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={task.is_completed}
                onChange={() => toggleTask(task.id, task.is_completed)}
              />
              <span>
                {task.title}
              </span>
              <button onClick={() => deleteTask(task.id)} className="delete-button">Delete</button>
            </li>
          ))}
        </ul>
      )}
       <button onClick={() => supabase.auth.signOut()} className="signout-button">
          Sign Out
        </button>
    </div>
  )
}
