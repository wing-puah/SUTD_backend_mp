import { User } from './user.model';
import { Todo } from './todo.model';

type Role = 'creator' | 'editor';

interface UserTodoMap {
  uid: User['id'];
  tid: Todo['id'];
  role?: Role;
  title?: Todo['title'];
}

class UserTodoMap {
  constructor(args: UserTodoMap) {
    const { uid, tid, role, title } = args;
    this.uid = uid;
    this.tid = tid;
    this.role = role;
    this.title = title;
  }
}

export { UserTodoMap };
