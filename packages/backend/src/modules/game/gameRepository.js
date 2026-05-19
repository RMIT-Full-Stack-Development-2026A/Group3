import mongoose from 'mongoose';
import { GameSession } from './gameModel.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

class GameRepository {
    async createSession(sessionData) {
        return await GameSession.create(sessionData);
    }

    async findById(sessionId) {
        return await GameSession.findById(sessionId)
            .populate('player1Id', 'username avatar')
            .populate('player2Id', 'username avatar')
            .lean();
    }



    async updateSessionWithPlayer2(sessionId, { player2Id, player2Name, player2Avatar, player2Rating }) {
        return await GameSession.findByIdAndUpdate(
            sessionId,
            {
                $set: {
                    player2Id,
                    player2Name,
                    player2Avatar,
                    status: 'ACTIVE'
                }
            },
            { new: true }
        );
    }

    async findPlayerHistory(userId, limit = 10) {
        return await GameSession.find({
            $or: [{ player1Id: userId }, { player2Id: userId }]
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
    }

    _buildBasePipeline ({ userId, search, result, date, dateFrom, dateTo }) {
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const pipeline = [
            {
                $match: {
                    status: { $ne: 'ACTIVE' },
                    $or: [
                        { player1Id: userObjectId },
                        { player2Id: userObjectId }
                    ]
                }
            },
            {
                $addFields: {
                    playedAt: { $ifNull: ['$updatedAt', '$createdAt'] },
                    matchIdStr: { $toString: '$_id' },
                    opponentName: {
                        $cond: {
                            if: { $eq: ['$player1Id', userObjectId] },
                            then: '$player2Name',
                            else: '$player1Name'
                        }
                    },
                    result: {
                        $switch: {
                            branches: [
                                {case: { $eq: ['$status', 'DRAW'] }, then: 'DRAW'},
                                {case: { $eq: ['$winnerId', userObjectId] }, then: 'WIN'}
                            ],
                            default: 'LOSS'
                        }
                    }
                }
            }
        ];
      
        if (search) {
            const regex = new RegExp(escapeRegex(search), 'i');
            pipeline.push({ $match: { $or: [{ matchIdStr: regex }, { opponentName: regex }] } });
        }
      
        if (result !== 'ALL') pipeline.push({ $match: { result } });
        
        if (date) {
            const nextDay = new Date(date);
            nextDay.setUTCDate(nextDay.getUTCDate() + 1);
            pipeline.push({ $match: { playedAt: {$gte: date, $lt: nextDay} } });
        } else if (dateFrom || dateTo) {
            const playedAt = {};
            if (dateFrom) playedAt.$gte = dateFrom; 
            if (dateTo) {
                const endOfDay = new Date(dateTo);
                endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
                playedAt.$lt = endOfDay;
            }
            pipeline.push({ $match: { playedAt } });
        }
      
        return pipeline;
    };
    
    async getPaginatedMatchHistory({ userId, page, limit, search, result, date, dateFrom, dateTo, sortOrder }) {
      const basePipeline = this._buildBasePipeline({userId, search, result, date, dateFrom, dateTo});
    
      const sortDirection = sortOrder === 'asc' ? 1 : -1;
      const safePage = Math.max(1, Number(page)); 
      const safeLimit = Math.max(1, Number(limit));
      const pageOffset = (safePage - 1) * safeLimit;
    
      const dataPipeline = [
        ...basePipeline,
        { $sort: { playedAt: sortDirection, _id: sortDirection } },
        { $skip: pageOffset },
        { $limit: safeLimit },
        {
          $project: {
            _id: 0,
            matchId: '$matchIdStr',
            gameType: 1,
            boardSize: 1,
            status: 1,
            opponentName: { $ifNull: ['$opponentName', 'Unknown'] },
            result: 1,
            playedAt: 1
          }
        }
      ];
    
      const countPipeline = [
        ...basePipeline,
        { $count: 'totalItems' }
      ];
    
      const [rows, countRows] = await Promise.all([
        GameSession.aggregate(dataPipeline),
        GameSession.aggregate(countPipeline)
      ]);
    
      const totalItems = countRows[0]?.totalItems || 0;
      const totalPages = Math.ceil(totalItems / safeLimit);
    
      return {
        items: rows,
        pagination: {
          page: safePage,
          limit: safeLimit,
          totalItems,
          totalPages,
          hasNextPage: safePage < totalPages,
          hasPreviousPage: safePage > 1 && totalPages > 0
        }
      };
    }
}

export default new GameRepository();
