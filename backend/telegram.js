
require("dotenv").config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.error("❌ TELEGRAM_BOT_TOKEN is missing from .env");
}

/* =========================================================
   TELEGRAM API HELPER
========================================================= */

async function telegramRequest(method, data = {}) {
    if (!token) {
        throw new Error("TELEGRAM_BOT_TOKEN is missing");
    }

    const response = await fetch(
        `https://api.telegram.org/bot${token}/${method}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );

    const result = await response.json();

    if (!result.ok) {
        throw new Error(
            result.description || "Telegram API request failed"
        );
    }

    return result;
}

/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendTelegramMessage(
    chatId,
    text,
    options = {}
) {
    return telegramRequest("sendMessage", {
        chat_id: chatId,
        text,
        ...options
    });
}

/* =========================================================
   PROCESS TELEGRAM UPDATE
========================================================= */

async function processTelegramUpdate(update) {
    if (!update || !update.message) {
        return;
    }

    const message = update.message;
    const chatId = message.chat?.id;

    if (!chatId) {
        return;
    }

    const text = message.text || "";

    /* =====================================================
       /START
    ===================================================== */

    if (/^\/start(?:@\w+)?$/i.test(text)) {
        const welcomeMessage = `
🌙 MASJIDUL-FATWA SHABAB 🌙

Assalaamu 'Alaikum Warahmatullaahi Wabarakaatuh 🤍

🌟 Baga Nagaan Dhuftan! 🌟

Kun Masjidul-Fatwa Shabab Contribution Management Bot dha.

Bot kana fayyadamuun:

💰 Gumaacha torban torbanii galmeessuu
👤 Odeeffannoo miseensaa ilaalu
📊 Haala gumaacha kee hordofuu
📅 Galmee gumaachaa kee ilaalu
📢 Beeksisaalee barbaachisoo argachuu

━━━━━━━━━━━━━━━━━━

🌍 ENGLISH

Welcome to the Masjidul-Fatwa Shabab Contribution Management Bot! 🤝

This is the official platform for managing and tracking weekly contributions.

You can:

💰 Record weekly contributions
👤 View member information
📊 Track contribution status
📅 View contribution records
📢 Receive important announcements

━━━━━━━━━━━━━━━━━━

🤝 MASJIDUL-FATWA SHABAB

Transparency • Responsibility • Unity

👨‍💻 Developer: Jemal Seid
`;

        try {
            await sendTelegramMessage(
                chatId,
                welcomeMessage,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: "🌐 Open Masjidul-Fatwa Website",
                                    url: "https://masjidul-fatwa-frontend.vercel.app/"
                                }
                            ]
                        ]
                    }
                }
            );

            console.log(
                `✅ /start welcome message sent to chat ${chatId}`
            );

        } catch (error) {
            console.error(
                "❌ Telegram /start error:",
                error.message
            );
        }

        return;
    }

    /* =====================================================
       /WEBSITE
    ===================================================== */

    if (/^\/website(?:@\w+)?$/i.test(text)) {
        try {
            await sendTelegramMessage(
                chatId,
                "🌐 Open the Masjidul-Fatwa website:",
                {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: "🌐 Open Website",
                                    url: "https://masjidul-fatwa-frontend.vercel.app/"
                                }
                            ]
                        ]
                    }
                }
            );

            console.log(
                `✅ Website button sent to chat ${chatId}`
            );

        } catch (error) {
            console.error(
                "❌ Telegram website command error:",
                error.message
            );
        }

        return;
    }
}

/* =========================================================
   SET WEBHOOK
========================================================= */

async function setTelegramWebhook(webhookUrl) {
    if (!webhookUrl) {
        console.error(
            "❌ Telegram webhook URL is missing."
        );

        return;
    }

    try {
        const result = await telegramRequest(
            "setWebhook",
            {
                url: webhookUrl
            }
        );

        if (result.ok) {
            console.log(
                "✅ Telegram webhook configured successfully."
            );

            console.log(
                `🔗 Webhook: ${webhookUrl}`
            );
        }

    } catch (error) {
        console.error(
            "❌ Telegram webhook configuration failed:",
            error.message
        );
    }
}

/* =========================================================
   EXPORT
========================================================= */

module.exports = {
    processTelegramUpdate,
    setTelegramWebhook
};

