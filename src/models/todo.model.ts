import { Item } from './item.model';
interface Todo {
  id?: number;
  title: string;
}

class Todo {
  constructor(args: Todo) {
    const { id, title } = args;
    this.id = id;
    this.title = title;
  }
}

interface SingleTodo extends Todo {
  items?: Item[];
}

export { Todo, SingleTodo };
