import { MdClose } from 'react-icons/md';
import './styles/task.css';
import type { Task } from '../models';
import { useCallback } from 'react';

interface TaskItemProps {
  task: Task,
  onToggle?: (done: boolean) => void;
  onDelete?: () => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const handleChange = useCallback(() => onToggle?.(!task.done), [onToggle, task.done]);
  const handleDelete = useCallback(() => onDelete?.(), [onDelete]);

  return (
    <div className='task'>
      <input
        type="checkbox"
        checked={task.done}
        onChange={handleChange}
        aria-label="Toggle task completion"
      />
      <p>{task.title}</p>
      {task.done && <button aria-label='Delete task' onClick={handleDelete}><MdClose /></button>}
    </div>
  );
}