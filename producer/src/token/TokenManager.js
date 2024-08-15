const Jwt = require('@hapi/jwt');

const TokenManager = {
  generateAccessToken: (payload) => {
    try {
      return Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('generateAccessToken error:', error); // Debugging statement
      throw error;
    }
  },
  generateRefreshToken: (payload) => {
    try {
      return Jwt.token.generate(payload, process.env.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('generateRefreshToken error:', error); // Debugging statement
      throw error;
    }
  },
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken);
      Jwt.token.verifySignature(artifacts, process.env.REFRESH_TOKEN_KEY);
      const { payload } = artifacts.decoded;
      return payload;
    } catch (error) {
      console.error('verifyRefreshToken error:', error); // Debugging statement
      throw error;
    }
  },
  verifyAccessToken: (accessToken) => {
    try {
      const artifacts = Jwt.token.decode(accessToken);
      Jwt.token.verifySignature(artifacts, process.env.ACCESS_TOKEN_KEY);
      const { payload } = artifacts.decoded;
      return payload;
    } catch (error) {
      console.error('verifyAccessToken error:', error);
      throw error;
    }
  },
};

module.exports = TokenManager;
