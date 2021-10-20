interface Item {
  id: number;
  description: string;
  tid?: number;
}

class Item {
  constructor(args: Item) {
    const { id, description, tid } = args;
    this.id = id;
    this.description = description;
    this.tid = tid;
  }
}

export { Item };
