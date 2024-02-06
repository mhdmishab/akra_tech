import Dexie from 'dexie';

export interface IUser {
  id?: number;
  name: {
    first: string;
    last: string;
  };
  picture: {
    large: string;
  };
}

export const db = new Dexie('database');

db.version(1).stores({
  users: '++id, name.first, name.last, picture.large',
});

// Use the table method directly on the Dexie instance
export const usersTable = db.table<IUser, number>('users');

  