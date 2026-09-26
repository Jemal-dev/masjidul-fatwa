
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

    let digits = String(phone).replace(/\D/g, "");

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
   FIND REGISTERED MEMBER BY TELEGRAM CHAT ID
========================================================= */

async function findMemberByTelegramChatId(chatId) {

    const [members] = await db.query(
        `
        SELECT
            id,
            full_name,
            phone,
            status,
            telegram_chat_id,
            telegram_username,
            created_at
        FROM members
        WHERE telegram_chat_id = ?
        LIMIT 1
        `,
        [String(chatId)]
    );

    if (members.length === 0) {
        return null;
    }

    return members[0];
}

/* =========================================================
   MAIN MENU
========================================================= */

async function sendMainMenu(chatId) {

    await sendTelegramMessage(
        chatId,
        `🌙 MASJIDUL-FATWA SHABAB

Welcome to your member dashboard. 🤝

Please choose an option:`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "👤 My Profile",
                            callback_data: "my_profile"
                        }
                    ],
                    [
                        {
                            text: "💰 My Contributions",
                            callback_data: "my_contributions"
                        },
                        {
                            text: "📊 Contribution Status",
                            callback_data: "contribution_status"
                        }
                    ],
                    [
                        {
                            text: "📅 Contribution History",
                            callback_data: "contribution_history"
                        }
                    ],
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
}

/* =========================================================
   MY PROFILE
========================================================= */

async function sendMyProfile(chatId) {

    const member =
        await findMemberByTelegramChatId(chatId);

    if (!member) {

        await sendTelegramMessage(
            chatId,
            `❌ Your Telegram account is not registered.

Please use:

/register

to connect your Telegram account to your Masjidul-Fatwa member account.`
        );

        return;
    }

    const status =
        member.status === "active"
            ? "🟢 Active"
            : "🔴 Inactive";

    const username =
        member.telegram_username
            ? `@${member.telegram_username}`
            : "Not set";

    const profileMessage = `
👤 MY PROFILE

━━━━━━━━━━━━━━━━━━

🆔 Member ID: ${member.id}

👤 Name: ${member.full_name}

📱 Phone: ${member.phone || "Not registered"}

📊 Status: ${status}

💬 Telegram: ${username}

━━━━━━━━━━━━━━━━━━

🤝 MASJIDUL-FATWA SHABAB
`;

    await sendTelegramMessage(
        chatId,
        profileMessage,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "🔙 Main Menu",
                            callback_data: "main_menu"
                        }
                    ]
                ]
            }
        }
    );
}

/* =========================================================
   PROCESS CALLBACK QUERY
========================================================= */

async function processCallbackQuery(callbackQuery) {

    if (!callbackQuery) {
        return;
    }

    const callbackId =
        callbackQuery.id;

    const chatId =
        callbackQuery.message?.chat?.id;

    const data =
        callbackQuery.data;

    if (!chatId || !data) {
        return;
    }

    /*
     * Tell Telegram that the button press
     * has been received.
     */

    try {

        await telegramRequest(
            "answerCallbackQuery",
            {
                callback_query_id: callbackId
            }
        );

    } catch (error) {

        console.error(
            "❌ Callback answer error:",
            error.message
        );
    }

    /* =====================================================
       MAIN MENU
    ===================================================== */

    if (data === "main_menu") {

        try {

            await sendMainMenu(chatId);

        } catch (error) {

            console.error(
                "❌ Main menu error:",
                error.message
            );
        }

        return;
    }

    /* =====================================================
       MY PROFILE
    ===================================================== */

    if (data === "my_profile") {

        try {

            await sendMyProfile(chatId);

        } catch (error) {

            console.error(
                "❌ My profile error:",
                error.message
            );

            await sendTelegramMessage(
                chatId,
                "❌ Could not load your profile. Please try again later."
            );
        }

        return;
    }

    /* =====================================================
       MY CONTRIBUTIONS
    ===================================================== */

    if (data === "my_contributions") {

        await sendTelegramMessage(
            chatId,
            `💰 MY CONTRIBUTIONS

This feature will show your weekly contribution records.

🔧 Contribution records are being connected to the Telegram bot.`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "🔙 Main Menu",
                                callback_data: "main_menu"
                            }
                        ]
                    ]
                }
            }
        );

        return;
    }

    /* =====================================================
       CONTRIBUTION STATUS
    ===================================================== */

    if (data === "contribution_status") {

        await sendTelegramMessage(
            chatId,
            `📊 CONTRIBUTION STATUS

This feature will show your current contribution status.

🔧 Contribution status is being connected to the Telegram bot.`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "🔙 Main Menu",
                                callback_data: "main_menu"
                            }
                        ]
                    ]
                }
            }
        );

        return;
    }

    /* =====================================================
       CONTRIBUTION HISTORY
    ===================================================== */

    if (data === "contribution_history") {

        await sendTelegramMessage(
            chatId,
            `📅 CONTRIBUTION HISTORY

This feature will show your complete contribution history.

🔧 Contribution history is being connected to the Telegram bot.`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "🔙 Main Menu",
                                callback_data: "main_menu"
                            }
                        ]
                    ]
                }
            }
        );

        return;
    }
}

/* =========================================================
   PROCESS TELEGRAM UPDATE
========================================================= */

async function processTelegramUpdate(update) {

    if (!update) {
        return;
    }

    /* =====================================================
       CALLBACK QUERY
    ===================================================== */

    if (update.callback_query) {

        await processCallbackQuery(
            update.callback_query
        );

        return;
    }

    /* =====================================================
       NORMAL MESSAGE
    ===================================================== */

    if (!update.message) {
        return;
    }

    const message = update.message;

    const chatId =
        message.chat?.id;

    if (!chatId) {
        return;
    }

    const text =
        message.text || "";

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
                            ],
                            [
                                {
                                    text: "📋 Open Member Menu",
                                    callback_data: "main_menu"
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
       /MENU
    ===================================================== */

    if (/^\/menu(?:@\w+)?$/i.test(text)) {

        try {

            const member =
                await findMemberByTelegramChatId(chatId);

            if (!member) {

                await sendTelegramMessage(
                    chatId,
                    `❌ Your Telegram account is not registered yet.

Please use:

/register

to register first.`
                );

                return;
            }

            await sendMainMenu(chatId);

            console.log(
                `✅ Member menu sent to chat ${chatId}`
            );

        } catch (error) {

            console.error(
                "❌ Telegram /menu error:",
                error.message
            );

            await sendTelegramMessage(
                chatId,
                "❌ Could not open the member menu. Please try again later."
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

Use /menu to open your member dashboard.`
                );

                return;
            }

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
    ===================================================== */

    if (message.contact) {

        const contact =
            message.contact;

        if (
            contact.user_id &&
            message.from?.id &&
            String(contact.user_id) !==
                String(message.from.id)
        ) {

            await sendTelegramMessage(
                chatId,
                "❌ Please use the button to share your own phone number."
            );

            return;
        }

        const phoneNumber =
            contact.phone_number;

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

            if (member.status === "inactive") {

                await sendTelegramMessage(
                    chatId,
                    `⚠️ Your membership is currently inactive.

👤 Name: ${member.full_name}

Please contact an administrator.`
                );

                return;
            }

            if (
                member.telegram_chat_id &&
                String(member.telegram_chat_id) !==
                    String(chatId)
            ) {

                await sendTelegramMessage(
                    chatId,
                    `⚠️ This member account is already connected to another Telegram account.

Please contact an administrator if this is incorrect.`
                );

                return;
            }

            const [alreadyConnected] =
                await db.query(
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

            const telegramUsername =
                message.from?.username
                    ? message.from.username
                    : null;

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

            await sendTelegramMessage(
                chatId,
                `✅ REGISTRATION SUCCESSFUL!

Welcome, ${member.full_name}! 🎉

Your Telegram account is now connected to your Masjidul-Fatwa member account.

👤 Name: ${member.full_name}
📱 Phone: ${member.phone}

Use /menu to open your member dashboard.

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
    ===================================================== */

    if (text.trim()) {

        await sendTelegramMessage(
            chatId,
            `I don't recognize that command.

Available commands:

/start - Start the bot
/register - Register your Telegram account
/menu - Open your member menu
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

        const result =
            await telegramRequest(
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

