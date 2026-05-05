import nodemailer from 'nodemailer';

/**
 * Email Utility - Nodemailer Transporter
 * Uses SMTP credentials from environment variables.
 */

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // TLS via STARTTLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Send an email using the configured transporter.
 * @param {{ to: string, subject: string, html: string }} options
 * @returns {Promise<object>} Nodemailer send result
 */
export async function sendMail({ to, subject, html }) {
    const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent to ${to} — MessageId: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`📧 Email failed to ${to}:`, error.message);
        // Don't throw — email failure should not break the main flow
        return null;
    }
}

/**
 * Build a styled HTML email for premium subscription confirmation.
 */
export function buildPremiumEmail({ username, plan, amount, validFrom, validUntil }) {
    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    });

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; font-family:'Segoe UI',Roboto,sans-serif; background-color:#0a0812; color:#ffffff;">
        <div style="max-width:560px; margin:0 auto; padding:40px 24px;">
            <!-- Header -->
            <div style="text-align:center; margin-bottom:32px;">
                <h1 style="font-size:28px; font-weight:800; margin:0; background:linear-gradient(135deg,#b3a1ff,#ffb1c8); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
                    TicTacToang
                </h1>
                <p style="color:#94a3b8; font-size:12px; letter-spacing:2px; text-transform:uppercase; margin-top:8px;">
                    Premium Subscription Confirmed
                </p>
            </div>

            <!-- Card -->
            <div style="background:linear-gradient(135deg,#1b192b,#232136); border:1px solid rgba(179,161,255,0.2); border-radius:16px; padding:32px; margin-bottom:24px;">
                <div style="text-align:center; margin-bottom:24px;">
                    <div style="display:inline-block; background:rgba(179,161,255,0.15); border:1px solid rgba(179,161,255,0.3); border-radius:12px; padding:12px 24px;">
                        <span style="font-size:24px;">👑</span>
                        <span style="font-size:16px; font-weight:700; color:#b3a1ff; margin-left:8px;">PREMIUM ACTIVATED</span>
                    </div>
                </div>

                <p style="color:#e2e8f0; font-size:16px; line-height:1.6; margin:0 0 24px;">
                    Hey <strong style="color:#b3a1ff;">${username}</strong>,<br><br>
                    Your Premium subscription is now active! You've unlocked the full power of TicTacToang.
                </p>

                <!-- Details -->
                <div style="background:rgba(255,255,255,0.03); border-radius:12px; padding:20px; margin-bottom:24px;">
                    <table style="width:100%; border-collapse:collapse;">
                        <tr>
                            <td style="padding:8px 0; color:#94a3b8; font-size:13px;">Plan</td>
                            <td style="padding:8px 0; text-align:right; font-weight:600; color:#ffffff;">${plan}</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 0; color:#94a3b8; font-size:13px;">Amount Paid</td>
                            <td style="padding:8px 0; text-align:right; font-weight:600; color:#b3a1ff;">$${amount.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 0; color:#94a3b8; font-size:13px;">Valid From</td>
                            <td style="padding:8px 0; text-align:right; font-weight:600; color:#ffffff;">${formatDate(validFrom)}</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 0; color:#94a3b8; font-size:13px;">Valid Until</td>
                            <td style="padding:8px 0; text-align:right; font-weight:600; color:#2dd4bf;">${formatDate(validUntil)}</td>
                        </tr>
                    </table>
                </div>

                <p style="color:#94a3b8; font-size:13px; line-height:1.6; margin:0;">
                    Enjoy exclusive features like advanced AI difficulty, custom markers, and priority matchmaking. Have fun battling! 🎮
                </p>
            </div>

            <!-- Footer -->
            <div style="text-align:center; color:#475569; font-size:11px;">
                <p>This is an automated email from TicTacToang. Please do not reply.</p>
                <p style="margin-top:8px;">© ${new Date().getFullYear()} TicTacToang. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}
