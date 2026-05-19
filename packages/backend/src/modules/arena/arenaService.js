import ArenaRepository from './arenaRepository.js';
import AuthService from '../auth/authService.js';
import GameRepository from '../game/gameRepository.js';
import ProfileService from '../profile/profileService.js';

let io = null;

const arenaService = {
	setIO(socketIo) {
		io = socketIo;
	},

	async createRoom(user, config = {}) {
		const creator = await AuthService.getUserById(user.id);
		const creatorData = await ProfileService.getProfileData(user.id);
		const code = await ArenaRepository.generateUniqueCode();
		
		// Extract config with defaults
		const boardSize = config.boardSize || 10;
		const boardTheme = config.boardTheme || 'DEFAULT';
		const player1Marker = config.players?.p1?.marker || 'CROSS';
		const player2Marker = config.players?.p2?.marker || 'CIRCLE';
		const moveFirst = config.currentTurn === 'PLAYER2' ? 'PLAYER2' : 'PLAYER1';
		const player1Avatar = creatorData.profile?.avatarUrl || '';
		
		const room = await ArenaRepository.createRoom({
			roomCode: code,
			player1Id: user.id,
			player1Name: creator.username || 'Player',
			player1Avatar,
			boardSize,
			player1Marker,
			player2Marker,
			moveFirst
		});

		// Create GameSession immediately with P1 data only (status: WAITING)
		try {
			const size = boardSize;
			const initialBoard = Array(size).fill(null).map(() => Array(size).fill(null));

			const sessionPayload = {
				gameType: 'ONLINE',
				boardSize: size,
				boardTheme: boardTheme,
				roomId: room._id,
				player1Id: user.id,
				player1Name: creatorData.user.username || creator.username || 'Player',
				player1Avatar: player1Avatar,
				player1Marker: player1Marker,
				player2Id: null,
				player2Name: 'Waiting for opponent...',
				player2Avatar: '',
				player2Marker: player2Marker,
				boardState: initialBoard,
				moves: [],
				currentTurn: moveFirst,
				status: 'WAITING' // Session starts in WAITING state
			};

			const session = await GameRepository.createSession(sessionPayload);

			// Persist session id on room
			await ArenaRepository.updateRoom(room._id, { sessionId: session._id });
		} catch (err) {
			console.error('Failed to create initial online session:', err);
		}

		// Broadcast new room to lobby
		if (io) io.emit('arena:room-created', { roomCode: room.roomCode, roomId: room._id, player1Name: room.player1Name, status: room.status });

		return room;
	},

	async listWaitingRooms() {
		return await ArenaRepository.listWaitingRooms();
	},

	async joinRoomByCode(user, roomCode) {
		const joiner = await AuthService.getUserById(user.id);
		const room = await ArenaRepository.findByCode(roomCode);
		if (!room) throw new Error('Room not found');
		if (room.status !== 'WAITING') throw new Error('Room is not joinable');
		if (room.player1Id?.toString() === user.id.toString()) throw new Error('Room owner cannot join their own room');

		const joinerData = await ProfileService.getProfileData(user.id);

		const updated = await ArenaRepository.updateRoom(room._id, {
			player2Id: user.id,
			player2Name: joiner.username || 'Player',
			status: 'PLAYING'
		});

		// Broadcast updated room to lobby
		if (io) io.emit('arena:room-updated', { roomCode: updated.roomCode, status: updated.status });

		// Update the existing session with P2 data and activate it
		try {
			const updatedSession = await GameRepository.updateSessionWithPlayer2(room.sessionId, {
				player2Id: user.id,
				player2Name: joinerData.user.username || joiner.username || updated.player2Name,
				player2Avatar: joinerData.profile?.avatarUrl || updated.player2Avatar || ''
			});

			// Notify players in the specific room channel
			const roomName = `room-${updated.roomCode}`;
			if (io) {
				io.to(roomName).emit('arena:game-started', { sessionId: updatedSession._id, roomCode: updated.roomCode });
				// Also broadcast to lobby clients (in case they haven't joined the room socket)
				io.emit('arena:game-started', { sessionId: updatedSession._id, roomCode: updated.roomCode });
			}

			return updated;
		} catch (err) {
			// If session update fails, still return the updated room but log the error
			console.error('Failed to activate online session:', err);
			return updated;
		}
	}
};

export default arenaService;
