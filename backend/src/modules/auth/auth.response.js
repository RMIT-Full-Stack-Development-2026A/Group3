const loginResponseDTO = {
  build: (user, token) => {
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      isPremium: user.isPremium,
      token: token
    };
  }
};

module.exports = {
  loginResponseDTO
};
