
require("dotenv").config();

const db = require("./config/db");

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.error("TELEGRAM_BOT_TOKEN is missing from .env");
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
   NORMALIZE ETHIOPIAN PHONE NUMBER
========================================================= */

function normalizeEthiopianPhone(phone) {
    if (!phone) {
        return null;
    }

    // Keep digits only
    let digits = String(phone).replace(/\D/g, "");

    /*
     * Ethiopian formats:
     *
     * 0911121314
     * 251911121314
     * +251911121314
     * 911121314
     *
     * Convert all of them to:
     *
     * 251911121314
     */

    if (digits.startsWith("00")) {
        digits = digits.substring(2);
    }

    if (digits.startsWith("251")) {
        return digits;
    }

    if (digits.startsWith("0")) {
        return "251" + digits.substring(1);
    }

    if (digits.length === 9 && digits.startsWith("9")) {
        return "251" + digits;
    }

    return digits;
}

/* =========================================================
   FIND MEMBER BY PHONE
========================================================= */

async function findMemberByPhone(phoneNumber) {
    const normalizedPhone =
        normalizeEthiopianPhone(phoneNumber);

    if (!normalizedPhone) {
        return null;
    }

    const [members] = await db.query(
        `
        SELECT
            id,
            full_name,
            phone,
            status,
            telegram_chat_id,
            telegram_username
        FROM members
        `
    );

    /*
     * Compare normalized versions in JavaScript.
     *
     * This handles:
     *
     * 0911121314
     * +251911121314
     * 251911121314
     * 911121314
     */

    for (const member of members) {

        const memberPhone =
            normalizeEthiopianPhone(member.phone);

        if (
            memberPhone &&
            memberPhone === normalizedPhone
        ) {
            return member;
        }
    }

    return null;
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

    /* =====================================================
       /REGISTER
    ===================================================== */

    if (/^\/register(?:@\w+)?$/i.test(text)) {

        try {

            /*
             * Check whether this Telegram account
             * is already registered.
             */

            const [existing] = await db.query(
                `
                SELECT
                    id,
                    full_name
                FROM members
                WHERE telegram_chat_id = ?
                LIMIT 1
                `,
                [String(chatId)]
            );

            if (existing.length > 0) {

                await sendTelegramMessage(
                    chatId,
                    `✅ You are already registered.

👤 Name: ${existing[0].full_name}

You can now use the Telegram bot to access your contribution information.`
                );

                return;
            }

            /*
             * Ask the user to share their phone number.
             */

            await sendTelegramMessage(
                chatId,
                `📝 MEMBER REGISTRATION

Please share the phone number that is already registered with Masjidul-Fatwa.

Tap the button below to share your phone number.`,
                {
                    reply_markup: {
                        keyboard: [
                            [
                                {
                                    text: "📱 Share My Phone Number",
                                    request_contact: true
                                }
                            ]
                        ],
                        resize_keyboard: true,
                        one_time_keyboard: true
                    }
                }
            );

            console.log(
                `📱 Registration started for chat ${chatId}`
            );

        } catch (error) {

            console.error(
                "❌ Telegram registration error:",
                error.message
            );

            await sendTelegramMessage(
                chatId,
                "❌ Registration could not be started. Please try again later."
            );
        }

        return;
    }

    /* =====================================================
       HANDLE SHARED PHONE NUMBER
========================================================= */

    if (message.contact) {

        const contact = message.contact;

        /*
         * Only accept a contact shared by the user themselves.
         */

        if (
            contact.user_id &&
            message.from?.id &&
            String(contact.user_id) !== String(message.from.id)
        ) {

            await sendTelegramMessage(
                chatId,
                "❌ Please use the button to share your own phone number."
            );

            return;
        }

        const phoneNumber = contact.phone_number;

        if (!phoneNumber) {

            await sendTelegramMessage(
                chatId,
                "❌ Phone number could not be read. Please try /register again."
            );

            return;
        }

        try {

            console.log(
                `📱 Telegram phone received: ${phoneNumber}`
            );

            console.log(
                `📱 Normalized phone: ${normalizeEthiopianPhone(phoneNumber)}`
            );

            /*
             * Find member using normalized Ethiopian phone number.
             */

            const member =
                await findMemberByPhone(phoneNumber);

            if (!member) {

                await sendTelegramMessage(
                    chatId,
                    `❌ MEMBER NOT FOUND

The phone number you shared is not registered in the Masjidul-Fatwa member list.

Please contact an administrator to make sure your phone number is registered correctly.`
                );

                return;
            }

            /*
             * Do not allow inactive members to register.
             */

            if (member.status === "inactive") {

                await sendTelegramMessage(
                    chatId,
                    `⚠️ Your membership is currently inactive.

👤 Name: ${member.full_name}

Please contact an administrator.`
                );

                return;
            }

            /*
             * Check whether another Telegram account
             * is already connected to this member.
             */

            if (
                member.telegram_chat_id &&
                String(member.telegram_chat_id) !== String(chatId)
            ) {

                await sendTelegramMessage(
                    chatId,
                    `⚠️ This member account is already connected to another Telegram account.

Please contact an administrator if this is incorrect.`
                );

                return;
            }

            /*
             * Check whether this Telegram account
             * is connected to another member.
             */

            const [alreadyConnected] = await db.query(
                `
                SELECT
                    id,
                    full_name
                FROM members
                WHERE telegram_chat_id = ?
                AND id <> ?
                LIMIT 1
                `,
                [
                    String(chatId),
                    member.id
                ]
            );

            if (alreadyConnected.length > 0) {

                await sendTelegramMessage(
                    chatId,
                    `⚠️ This Telegram account is already connected to another member.

👤 Connected member: ${alreadyConnected[0].full_name}

Please contact an administrator if this is incorrect.`
                );

                return;
            }

            /*
             * Get Telegram username.
             */

            const telegramUsername =
                message.from?.username
                    ? message.from.username
                    : null;

            /*
             * Save Telegram information.
             */

            await db.query(
                `
                UPDATE members
                SET
                    telegram_chat_id = ?,
                    telegram_username = ?
                WHERE id = ?
                `,
                [
                    String(chatId),
                    telegramUsername,
                    member.id
                ]
            );

            /*
             * Remove phone-sharing keyboard.
             */

            await sendTelegramMessage(
                chatId,
                `✅ REGISTRATION SUCCESSFUL!

Welcome, ${member.full_name}! 🎉

Your Telegram account is now connected to your Masjidul-Fatwa member account.

👤 Name: ${member.full_name}
📱 Phone: ${member.phone}

You can now use the Telegram bot for your contribution information.

🤝 MASJIDUL-FATWA SHABAB`,
                {
                    reply_markup: {
                        remove_keyboard: true
                    }
                }
            );

            console.log(
                `✅ Member ${member.id} (${member.full_name}) registered Telegram chat ${chatId}`
            );

        } catch (error) {

            console.error(
                "❌ Telegram contact registration error:",
                error.message
            );

            await sendTelegramMessage(
                chatId,
                "❌ Registration failed because of a server error. Please try again later."
            );
        }

        return;
    }

    /* =====================================================
       UNKNOWN MESSAGE
========================================================= */

    if (text.trim()) {

        await sendTelegramMessage(
            chatId,
            `I don't recognize that command.

Available commands:

/start - Start the bot
/register - Register your Telegram account
/website - Open the website`
        );
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

