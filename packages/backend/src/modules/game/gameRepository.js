import mongoose from 'mongoose';
import { GameSession } from './gameModel.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildHistoryBasePipeline = ({ userId, search, result, date, dateFrom, dateTo }) => {
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
        playedAt: {
          $ifNull: ['$endTime', { $ifNull: ['$updatedAt', '$createdAt'] }]
        },
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
              {
                case: { $eq: ['$status', 'DRAW'] },
                then: 'DRAW'
              },
              {
                case: {
                  $and: [
                    { $eq: ['$status', 'LOSS'] },
                    { $eq: ['$player1Id', userObjectId] }
                  ]
                },
                then: 'LOSS'
              },
              {
                case: {
                  $or: [
                    {
                      $and: [
                        { $eq: ['$status', 'WIN'] },
                        { $eq: ['$winnerId', userObjectId] }
                      ]
                    },
                    { $eq: ['$winnerId', userObjectId] }
                  ]
                },
                then: 'WIN'
              }
            ],
            default: 'LOSS'
          }
        }
      }
    }
  ];

  if (search) {
    const regex = new RegExp(escapeRegex(search), 'i');
    pipeline.push({
      $match: {
        $or: [
          { matchIdStr: regex },
          { opponentName: regex }
        ]
      }
    });
  }

  if (result !== 'ALL') {
    pipeline.push({
      $match: { result }
    });
  }

  if (date) {
    const nextDay = new Date(date);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    pipeline.push({
      $match: {
        playedAt: {
          $gte: date,
          $lt: nextDay
        }
      }
    });
  } else if (dateFrom || dateTo) {
    const playedAt = {};

    if (dateFrom) {
      playedAt.$gte = dateFrom;
    }

    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
      playedAt.$lt = endOfDay;
    }

    pipeline.push({
      $match: {
        playedAt
      }
    });
  }

  return pipeline;
};

/**
 * Game Repository - Handles all direct MongoDB operations for Game Sessions
 */
const GameRepository = {
  /**
   * Create a new game session in the database
   */
  createSession: async (sessionData) => {
    const session = new GameSession(sessionData);
    return await session.save();
  },

  /**
   * Retrieve a game session by its ID
   */
  getSessionById: async (id) => {
    return await GameSession.findById(id);
  },

  /**
   * Add a move and update the board state of a session
   */
  updateSessionBoard: async (sessionId, move, newBoardState) => {
    return await GameSession.findByIdAndUpdate(
      sessionId,
      {
        $push: { moves: move },
        $set: { boardState: newBoardState }
      },
      { new: true }
    );
  },

  /**
   * Update the final status and winner of a session
   */
  updateSessionStatus: async (sessionId, status, winnerId, winLine = []) => {
    return await GameSession.findByIdAndUpdate(
      sessionId,
      {
        $set: {
          status,
          winnerId,
          winLine
        }
      },
      { new: true }
    );
  },

  /**
   * Query authenticated user's match history with filters and pagination
   */
  getPaginatedHistory: async ({ userId, page, limit, search, result, date, dateFrom, dateTo, sortOrder }) => {
    const basePipeline = buildHistoryBasePipeline({
      userId,
      search,
      result,
      date,
      dateFrom,
      dateTo
    });

    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const pageOffset = (page - 1) * limit;

    const dataPipeline = [
      ...basePipeline,
      { $sort: { playedAt: sortDirection, _id: sortDirection } },
      { $skip: pageOffset },
      { $limit: limit },
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
    const totalPages = totalItems > 0 ? Math.ceil(totalItems / limit) : 0;

    return {
      items: rows,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1 && totalPages > 0
      }
    };
  }
};

export default GameRepository;

