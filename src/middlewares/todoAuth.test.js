const { getMockReq, getMockRes } = require('@jest-mock/express');
const TodoAuthMiddleware = require('./todoAuth');

const service = {
  verifyUserAndTodo: jest.fn(),
};

const todoAuthMiddleware = TodoAuthMiddleware(service);

describe('Todo authentication middleware', () => {
  let req;

  beforeEach(() => {
    req = getMockReq({
      headers: {
        authorization: 'Bearer some_token',
      },
      uid: 1,
      params: {
        todoId: 1,
      },
    });
  });

  describe('given a request with no permission', () => {
    it('should return 403', async () => {
      service.verifyUserAndTodo.mockReturnValue(null);
      const { res, next } = getMockRes();
      await todoAuthMiddleware(req, res, next);

      expect(next).not.toBeCalled();
      expect(res.status).toBeCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: `Todo ${req.params.todoId} is not found for user` })
      );
    });
  });

  describe('given a request with permission', () => {
    it('should call next if token is valid', async () => {
      service.verifyUserAndTodo.mockReturnValue(1);
      const { res, next } = getMockRes();
      await todoAuthMiddleware(req, res, next);
      expect(next).toBeCalled();
    });
  });

  describe('given a request that will cause the db to throw', () => {
    it('should display the error', async () => {
      const dbError = new Error('db error');
      service.verifyUserAndTodo.mockRejectedValue(dbError);
      const { res, next } = getMockRes();
      await todoAuthMiddleware(req, res, next);
      expect(next).toBeCalledWith(dbError);
    });
  });
});
