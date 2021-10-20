interface User {
  id: number;
  email: string;
  password_hash?: string;
}

class User {
  constructor(args: User) {
    const { id, email, password_hash } = args;
    this.id = id;
    this.email = email;
    this.password_hash = password_hash;
  }
}

export { User };
