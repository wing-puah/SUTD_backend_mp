class User {
  constructor({ id, username, passwordHash }) {
    this.id = id;
    this.username = username;
    this.password_hash = passwordHash;
  }
}

module.exports = User;
