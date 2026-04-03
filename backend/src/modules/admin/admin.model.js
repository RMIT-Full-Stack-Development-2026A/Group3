import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'admin' }
}, { timestamps: true });

const auditLogSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'admin', required: true },
    action: { type: String, enum: ['BAN_USER', 'FORCE_CLOSE_ROOM', 'UNBAN_USER'], required: true },
    targetId: { type: String, required: true },
    oldValue: { type: mongoose.Schema.Types.Mixed }, // Mixed cho phép lưu Object JSON linh hoạt
    newValue: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

export const Admin = mongoose.model('admin', adminSchema);
export const AuditLog = mongoose.model('audit_log', auditLogSchema);