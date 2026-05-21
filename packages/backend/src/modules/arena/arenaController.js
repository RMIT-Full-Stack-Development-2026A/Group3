import arenaService from './arenaService.js';

const ArenaController = {
	async createRoom(req, res) {
		try {
			const user = req.user;
			const config = req.body;
			const room = await arenaService.createRoom(user, config);
			return res.status(201).json({ success: true, data: room });
		} catch (err) {
			return res.status(400).json({ success: false, message: err.message });
		}
	},

	async listRooms(req, res) {
		try {
			const rooms = await arenaService.listWaitingRooms();
			return res.status(200).json({ success: true, data: rooms });
		} catch (err) {
			return res.status(500).json({ success: false, message: err.message });
		}
	},

	async joinRoom(req, res) {
		try {
			const user = req.user;
			const { code } = req.params;
			const room = await arenaService.joinRoomByCode(user, code);
			return res.status(200).json({ success: true, data: room });
		} catch (err) {
			return res.status(400).json({ success: false, message: err.message });
		}
	}
};

export default ArenaController;
