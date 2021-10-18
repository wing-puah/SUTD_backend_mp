module.exports = (service) => {
  return async (req, res, next) => {
    try {
      const uid = req.uid;
      const tid = req.params.todoId;

      const permission = await service.verifyUserAndTodo(uid, tid);

      if (!permission) {
        res.status(403).json({ error: `Todo ${tid} is not found for user` });
        return;
      }

      return next();
    } catch (error) {
      next(error);
    }
  };
};
