import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, index: true },
    action: { type: String, enum: ['BAN_USER', 'CLOSE_ROOM', 'UNBAN_USER'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    targetType: {type: String, enum: ['USER', 'ROOM'], required: true },
    oldValue: { type: mongoose.Schema.Types.Mixed, default: null }, // Mixed cho phép lưu Object JSON linh hoạt
    newValue: { type: mongoose.Schema.Types.Mixed, default: null },
    reason: { type: String, trim: true, default: '' }
}, { timestamps: { createdAt: true, updatedAt: false } });

export const AuditLog = mongoose.model('audit_log', auditLogSchema);