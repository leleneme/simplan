import './styles/app.css';

import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useMemo, useState } from 'react';
import { ensureDefaultProject, getDatabase } from './database';
import type { Task } from './models';
import { useDialog } from './ui/dialog';
import { Dropdown } from './ui/dropdown';
import { InputButton } from './ui/input';
import { TaskItem } from './ui/task';

const db = getDatabase();

function useProjects() {
  const projects = useLiveQuery(() => db.projects.toArray(), [], []) ?? [];

  const addProject = useCallback(async (name: string) => await db.projects.add({ name }), []);
  const deleteProject = useCallback(async (id: number) => {
    await db.projects.delete(id);
    await db.tasks.where('projectId').equals(id).delete();
  }, []);

  return { projects, addProject, deleteProject };
}

function useTasks(projectId: number | null) {
  const tasks = useLiveQuery(async () => {
    if (!projectId) return [];

    return db.tasks
      .where('projectId').equals(projectId)
      .reverse()
      .toArray();
  }, [projectId]) ?? [];

  const addTask = async (title: string) => {
    if (!projectId) return;
    await db.tasks.add({ title, done: false, projectId });
  };

  const updateTask = async (id: number, done: boolean) =>
    await db.tasks.update(id, { done });

  const deleteTask = async (id: number) => await db.tasks.delete(id);

  return { tasks, addTask, updateTask, deleteTask };
}

function App() {
  const [todoText, setTodoText] = useState<string>('');
  const [showDone, setShowDone] = useState<boolean>(true);
  const [projectId, setProjectId] = useState<number | null>(null);

  const { tasks, addTask, updateTask, deleteTask } = useTasks(projectId);
  const { projects, addProject, deleteProject } = useProjects();
  const { openDialog } = useDialog();

  useLiveQuery(async () => {
    const id = await ensureDefaultProject();
    setProjectId(id);
  }, [setProjectId]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const newTask = todoText.trim();
    if (!newTask) return;

    if (newTask.length > 300) {
      await openDialog('alert', 'Task is too long!',
        'The maximum number of allowed characters is 300.');
      return;
    }

    if (!projectId) {
      await openDialog('alert', 'No Project', 'Please select a project first.');
      return;
    }

    await addTask(newTask);
    setTodoText('');
  }, [addTask, projectId, todoText, openDialog]);

  const handleToggle = useCallback(async (id: number, done: boolean) => {
    await updateTask(id, done);
  }, [updateTask]);

  const handleDelete = useCallback(async (id: number) => {
    await deleteTask(id);
  }, [deleteTask]);

  const handleProjectAdd = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 50) {
      await openDialog('alert', 'Invalid Name', 'Project name must be between 1 and 50 characters.');
      return;
    }

    const id = await addProject(trimmed);
    setProjectId(id);
  }, [addProject, openDialog]);

  const handleProjectDelete = useCallback(async (id: number) => {
    if (projects.length === 1) {
      await openDialog('alert', 'Cannot Delete Project', 'You cannot delete the last project!');
      return;
    }

    const confirmed = await openDialog(
      'confirm',
      'Delete Project',
      `Are you sure you want to delete project '${projects.find(p => p.id === id)?.name}'?\nAll tasks from this project will be deleted.`
    );

    if (confirmed) {
      await deleteProject(id);
      if (projectId === id) setProjectId(projects[0]?.id ?? null);
    }
  }, [deleteProject, projectId, projects, openDialog]);

  const { active: activeTasks, done: doneTasks } = useMemo(() => (
    tasks
      .reduce((acc, t) => {
        acc[t.done ? 'done' : 'active'].push(t);
        return acc;
      }, { active: [] as Task[], done: [] as Task[] })
  ), [tasks]);

  return (
    <main>
      <header>
        <span>Tasks for</span>
        <Dropdown
          options={projects
            .filter(p => p.id !== undefined)
            .map(p => ({ id: p.id!, name: p.name }))}
          selectedId={projectId ?? undefined}
          onChange={setProjectId}
          onAdd={handleProjectAdd}
          onDelete={handleProjectDelete}
        />
      </header>

      <form onSubmit={handleSubmit}>
        <InputButton
          maxLenght={300}
          type='submit'
          placeholder='New task...'
          value={todoText}
          onValueChange={setTodoText} />
      </form>

      {tasks.length == 0 && <div className='none-message'>
        <p>No current tasks.</p>
      </div>}

      {activeTasks.length > 0 && <div className='task-list'>
        <h3>TODO</h3>
        {activeTasks.map(t => (
          <TaskItem
            key={t.id!}
            task={t}
            onToggle={done => handleToggle(t.id!, done)}
          />
        ))}
      </div>}

      {doneTasks.length > 0 && <div className='task-list'>
        <div className='task-list-toggle'>
          <h3>Completed {doneTasks.length > 0 && `(${doneTasks.length})`}</h3>
          <button onClick={() => setShowDone(!showDone)}>{showDone ? 'Hide' : 'Show'}</button>
        </div>
        {showDone &&
          <>
            {doneTasks.map((t, i) => (
              <TaskItem
                key={i}
                task={t}
                onToggle={done => handleToggle(t.id!, done)}
                onDelete={() => handleDelete(t.id!)}
              />
            ))}
          </>}
      </div>}
    </main>
  );
}

export default App;
