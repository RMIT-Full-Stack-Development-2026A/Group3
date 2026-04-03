/** admin model */

import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['BAN_USER', 'FORCE_CLOSE_ROOM', 'UPDATE_CONFIG'], required: true },
    targetId: { type: String, required: true },
    oldValue: { type: mongoose.Schema.Types.Mixed }, // Cho phép lưu JSON linh hoạt
    newValue: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now }
});

const systemConfigSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export const SystemConfig = mongoose.model('SystemConfig', systemConfigSchema);