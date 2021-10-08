class User {
  constructor({ id, email, password_hash }) {
    this.id = id;
    this.email = email;
    this.password_hash = password_hash;
  }
}

module.exports = User;
