const { getMockReq, getMockRes } = require('@jest-mock/express');
const AuthMiddleware = require('./auth');

const service = {
  verifyUserAndTodo: jest.fn(),
};

const authMiddleware = AuthMiddleware(service);

describe('Todo authentication middleware', () => {
  beforeEach(() => {
    req = getMockReq({
      headers: {
        authorization: 'Bearer some_token',
      },
    });
  });
  describe('given a request with no token', () => {
    it('should return 401', async () => {
      service.verifyToken.mockReturnValue(null);
      const req = getMockReq();
      const { res, next } = getMockRes();
      authMiddleware(req, res, next);
      expect(next).not.toBeCalled();
      expect(res.status).toBeCalledWith(403);
    });
  });

  describe('given a request with a token', () => {
    let req;

    it('should call next if token is valid', async () => {
      service.verifyToken.mockReturnValue(1);
      const { res, next } = getMockRes();
      authMiddleware(req, res, next);
      expect(next).toBeCalled();
    });
  });
});
