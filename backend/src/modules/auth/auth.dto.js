/**
 * Auth DTOs
 * Request validation and response shaping for auth endpoints
 */

const loginRequestDTO = {
	validate: (body = {}) => {
		const safeBody = body && typeof body === 'object' ? body : {};
		const { identifier, password } = safeBody;

		if (!identifier || typeof identifier !== 'string') {
			throw new Error('identifier is required and must be a string (username or email)');
		}

		if (!password || typeof password !== 'string') {
			throw new Error('password is required and must be a string');
		}

		return {
			identifier: identifier.trim(),
			password: password
		};
	}
};

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
	loginRequestDTO,
	loginResponseDTO
};
