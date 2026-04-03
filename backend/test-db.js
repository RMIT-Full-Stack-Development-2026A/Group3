import mongoose from 'mongoose';
import 'dotenv/config'; // Dòng này tự động nạp dữ liệu từ file .env vào process.env
import { User } from './src/modules/users/users.model.js';
import { SecurityLog } from './src/modules/auth/auth.model.js';

const runTest = async () => {
    try {
        // 1. Lấy chuỗi kết nối trực tiếp từ file .env
        const MONGO_URI = process.env.MONGO_URI;

        if (!MONGO_URI) {
            console.error('❌ LỖI: Không tìm thấy biến MONGO_URI trong file .env. Hãy kiểm tra lại file .env của bạn.');
            process.exit(1);
        }

        console.log('⏳ Đang thử kết nối tới MongoDB Atlas...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Đã kết nối MongoDB thành công!');

        // Xóa dữ liệu cũ để test từ đầu
        await User.deleteMany({});
        await SecurityLog.deleteMany({});

        // 2. Test Create (Tạo dữ liệu chuẩn)
        console.log('⏳ Đang tạo User...');
        const newUser = await User.create({
            username: 'player_one',
            email: 'player1@gmail.com',
            passwordHash: 'hashed_password_123',
            country: 'VN'
        });
        console.log(`✅ Tạo User thành công: ID = ${newUser._id}`);

        // 3. Test Ràng buộc Unique (Cố tình tạo trùng Email)
        console.log('⏳ Đang test ràng buộc Unique Index...');
        try {
            await User.create({
                username: 'player_two',
                email: 'player1@gmail.com', // CỐ TÌNH TRÙNG EMAIL
                passwordHash: 'xyz',
                country: 'US'
            });
            console.log('❌ LỖI: Hệ thống không chặn được email trùng!');
        } catch (error) {
            if (error.code === 11000) {
                console.log('✅ Test Unique Index thành công: Hệ thống đã chặn email trùng lặp!');
            } else {
                console.log('⚠️ Lỗi không xác định:', error.message);
            }
        }

        // 4. Test TTL Index (Tự động xóa)
        console.log('⏳ Đang test tạo Security Log (TTL Index)...');
        await SecurityLog.create({
            ipAddress: '192.168.1.1',
            event: 'LOGIN_FAILED'
        });
        console.log('✅ Đã tạo Log. Log này sẽ tự động biến mất sau 1 giờ theo thiết kế TTL.');

        console.log('🎉 TOÀN BỘ BÀI TEST DATABASE HOÀN TẤT!');
        process.exit(0);
    } catch (error) {
        console.error('❌ LỖI HỆ THỐNG:', error);
        process.exit(1);
    }
};

runTest();