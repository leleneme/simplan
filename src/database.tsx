import Dexie, { type Table } from 'dexie';
import type { Project, Task } from './models';

const defaultProject = { name: "Default project" };

export class SimplanDB extends Dexie {
  tasks!: Table<Task, number>;
  projects!: Table<Project, number>;

  constructor() {
    super('simplan');
    this.version(2).stores({
      tasks: '++id, title, done, projectId, createdAt',
      projects: '++id, name, createdAt'
    });
  }
}

const db = new SimplanDB();

export async function ensureDefaultProject() {
  const count = await db.projects.count();
  if (count === 0) {
    const id = await db.projects.add(defaultProject);
    return id;
  }

  const first = await db.projects.orderBy('id').first();
  return first!.id!;
}

db.on('populate', async () => {
  await db.projects.add(defaultProject);
});

db.on('ready', async () => await ensureDefaultProject());

export function getDatabase() { return db; }