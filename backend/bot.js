
// ============================================================
// MASJIDUL-FATWA SHABAB TELEGRAM BOT
// ============================================================

const https = require("https");
require("dotenv").config();

const db = require("./config/db");

// ============================================================
// CONFIGURATION
// ============================================================

const token = process.env.TELEGRAM_BOT_TOKEN;

const adminIds = (process.env.TELEGRAM_ADMIN_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

const TELEGRAM_API =
    `https://api.telegram.org/bot${token}`;

// ============================================================
// BOT STATE
// ============================================================

let offset = 0;
let polling = true;

// Stores users who selected a member and are expected
// to enter a contribution amount.
const contributionSessions = new Map();

// ============================================================
// TELEGRAM API REQUEST
// ============================================================

function telegramRequest(method, data = {}) {

    return new Promise((resolve, reject) => {

        const url =
            `${TELEGRAM_API}/${method}`;

        const request =
            https.get(
                url +
                "?" +
                new URLSearchParams(data).toString(),
                (response) => {

                    let body = "";

                    response.on(
                        "data",
                        (chunk) => {
                            body += chunk;
                        }
                    );

                    response.on(
                        "end",
                        () => {

                            try {

                                const result =
                                    JSON.parse(body);

                                if (!result.ok) {

                                    reject(
                                        new Error(
                                            result.description ||
                                            "Telegram API error"
                                        )
                                    );

                                    return;
                                }

                                resolve(
                                    result.result
                                );

                            } catch (error) {

                                reject(error);
                            }
                        }
                    );
                }
            );

        request.on(
            "error",
            reject
        );
    });
}

// ============================================================
// SEND MESSAGE
// ============================================================

async function sendMessage(
    chatId,
    text,
    options = {}
) {

    return await telegramRequest(
        "sendMessage",
        {
            chat_id: chatId,
            text,
            parse_mode: "HTML",
            ...options
        }
    );
}

// ============================================================
// ANSWER CALLBACK
// ============================================================

async function answerCallbackQuery(
    callbackQueryId,
    text = ""
) {

    try {

        await telegramRequest(
            "answerCallbackQuery",
            {
                callback_query_id:
                    callbackQueryId,
                text
            }
        );

    } catch (error) {

        console.error(
            "Callback answer error:",
            error.message
        );
    }
}

// ============================================================
// EDIT MESSAGE
// ============================================================

async function editMessage(
    chatId,
    messageId,
    text,
    options = {}
) {

    return await telegramRequest(
        "editMessageText",
        {
            chat_id: chatId,
            message_id: messageId,
            text,
            parse_mode: "HTML",
            ...options
        }
    );
}

// ============================================================
// ADMIN CHECK
// ============================================================

function isAdmin(chatId) {

    return adminIds.includes(
        String(chatId)
    );
}

// ============================================================
// TODAY DATE
// ============================================================

function getToday() {

    const date =
        new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// ============================================================
// MAIN MENU
// ============================================================

function mainMenu() {

    return {

        inline_keyboard: [

            [
                {
                    text: "👥 Members",
                    callback_data:
                        "menu_members"
                },
                {
                    text: "💰 Contributions",
                    callback_data:
                        "menu_contribution"
                }
            ],

            [
                {
                    text: "📊 Weekly Report",
                    callback_data:
                        "report_weekly"
                },
                {
                    text: "📅 Monthly Report",
                    callback_data:
                        "report_monthly"
                }
            ],

            [
                {
                    text: "ℹ️ Help",
                    callback_data:
                        "menu_help"
                }
            ]

        ]
    };
}

// ============================================================
// ADMIN MENU
// ============================================================

function adminMenu() {

    return {

        inline_keyboard: [

            [
                {
                    text: "👥 Members",
                    callback_data:
                        "menu_members"
                },
                {
                    text: "💰 Contributions",
                    callback_data:
                        "menu_contribution"
                }
            ],

            [
                {
                    text: "📊 Weekly Report",
                    callback_data:
                        "report_weekly"
                },
                {
                    text: "📅 Monthly Report",
                    callback_data:
                        "report_monthly"
                }
            ],

            [
                {
                    text: "ℹ️ Help",
                    callback_data:
                        "menu_help"
                }
            ]

        ]
    };
}

// ============================================================
// WELCOME MESSAGE
// ============================================================

async function showWelcome(chatId) {

    const welcome = `🌙 <b>Welcome to the Masjidul-Fatwa Shabab Bot!</b> 🌟

This is the official Telegram platform for <b>Masjidul-Fatwa Shabab</b>.

Here you can manage Shabab membership, weekly contributions, and contribution reports in an organized and transparent way.

<b>What you can do here:</b>

👥 <b>Members</b> — View active Shabab members
💰 <b>Contributions</b> — Record weekly contributions
📊 <b>Weekly Report</b> — Check weekly payments
📅 <b>Monthly Report</b> — View monthly contribution records
ℹ️ <b>Help</b> — Learn how to use the bot

━━━━━━━━━━━━━━━━━━

🕌 <b>Masjidul-Fatwa Shabab</b>

🤲 May Allah accept our contributions, strengthen our brotherhood, and bless our efforts.

━━━━━━━━━━━━━━━━━━

👨‍💻 <b>Developer:</b> Jemal Seid

Choose an option below 👇`;

    await sendMessage(
        chatId,
        welcome,
        {
            reply_markup:
                JSON.stringify(
                    isAdmin(chatId)
                        ? adminMenu()
                        : mainMenu()
                )
        }
    );
}

// ============================================================
// HELP
// ============================================================

async function showHelp(chatId) {

    const help = `📋 <b>Masjidul-Fatwa Shabab Bot Help</b>

<b>Available commands:</b>

/start — Open the main menu
/help — Show help
/members — Show active members

<b>💰 Contribution</b>

/addcontribution MEMBER_ID AMOUNT

Example:
<code>/addcontribution 5 20</code>

<b>📊 Reports</b>

/report weekly

Example:
<code>/report weekly 2026-09-24</code>

/report monthly

Example:
<code>/report monthly 2026-09</code>

━━━━━━━━━━━━━━━━━━

🔐 <b>Administrator:</b>

${
    isAdmin(chatId)
        ? "✅ You are authorized as an administrator."
        : "❌ Administrator access is not enabled for your account."
}`;

    await sendMessage(
        chatId,
        help,
        {
            reply_markup:
                JSON.stringify({
                    inline_keyboard: [
                        [
                            {
                                text: "🔙 Main Menu",
                                callback_data:
                                    "main_menu"
                            }
                        ]
                    ]
                })
        }
    );
}

// ============================================================
// SHOW MEMBERS
// ============================================================

async function showMembers(
    chatId,
    messageId = null
) {

    try {

        const [members] =
            await db.query(`
                SELECT
                    id,
                    full_name,
                    phone,
                    telegram_username,
                    status
                FROM members
                WHERE status = 'active'
                ORDER BY full_name ASC
            `);

        if (
            members.length === 0
        ) {

            const text =
                "👥 <b>Shabab Members</b>\n\n" +
                "No active members found.";

            if (messageId) {

                await editMessage(
                    chatId,
                    messageId,
                    text,
                    {
                        reply_markup:
                            JSON.stringify({
                                inline_keyboard: [
                                    [
                                        {
                                            text: "🔙 Main Menu",
                                            callback_data:
                                                "main_menu"
                                        }
                                    ]
                                ]
                            })
                    }
                );

            } else {

                await sendMessage(
                    chatId,
                    text
                );
            }

            return;
        }

        let text =
            "👥 <b>Masjidul-Fatwa Shabab Members</b>\n\n";

        members.forEach(
            (member, index) => {

                text +=
                    `${index + 1}. <b>${member.full_name}</b>\n` +
                    `   🆔 ID: <code>${member.id}</code>\n`;

                if (
                    member.phone
                ) {

                    text +=
                        `   📱 ${member.phone}\n`;
                }

                if (
                    member.telegram_username
                ) {

                    text +=
                        `   📲 ${member.telegram_username}\n`;
                }

                text += "\n";
            }
        );

        const keyboard = {

            inline_keyboard: [

                [
                    {
                        text: "💰 Record Contribution",
                        callback_data:
                            "menu_contribution"
                    }
                ],

                [
                    {
                        text: "🔙 Main Menu",
                        callback_data:
                            "main_menu"
                    }
                ]

            ]
        };

        if (messageId) {

            await editMessage(
                chatId,
                messageId,
                text,
                {
                    reply_markup:
                        JSON.stringify(
                            keyboard
                        )
                }
            );

        } else {

            await sendMessage(
                chatId,
                text,
                {
                    reply_markup:
                        JSON.stringify(
                            keyboard
                        )
                }
            );
        }

    } catch (error) {

        console.error(
            "Members error:",
            error
        );

        await sendMessage(
            chatId,
            "❌ Failed to load members."
        );
    }
}

// ============================================================
// CONTRIBUTION MEMBER SELECTION
// ============================================================

async function showContributionMembers(
    chatId,
    messageId = null
) {

    if (
        !isAdmin(chatId)
    ) {

        await sendMessage(
            chatId,
            "🔐 <b>Administrator access required.</b>\n\nOnly authorized administrators can record contributions."
        );

        return;
    }

    try {

        const [members] =
            await db.query(`
                SELECT
                    id,
                    full_name
                FROM members
                WHERE status = 'active'
                ORDER BY full_name ASC
            `);

        if (
            members.length === 0
        ) {

            await sendMessage(
                chatId,
                "❌ No active members found."
            );

            return;
        }

        const keyboard = [];

        members.forEach(
            (member) => {

                keyboard.push([
                    {
                        text:
                            `👤 ${member.full_name}`,
                        callback_data:
                            `select_member_${member.id}`
                    }
                ]);
            }
        );

        keyboard.push([
            {
                text: "🔙 Main Menu",
                callback_data:
                    "main_menu"
            }
        ]);

        const text =
            `💰 <b>Record Contribution</b>

Select the member who is making the contribution:`;

        if (messageId) {

            await editMessage(
                chatId,
                messageId,
                text,
                {
                    reply_markup:
                        JSON.stringify({
                            inline_keyboard:
                                keyboard
                        })
                }
            );

        } else {

            await sendMessage(
                chatId,
                text,
                {
                    reply_markup:
                        JSON.stringify({
                            inline_keyboard:
                                keyboard
                        })
                }
            );
        }

    } catch (error) {

        console.error(
            "Contribution member error:",
            error
        );

        await sendMessage(
            chatId,
            "❌ Failed to load members."
        );
    }
}

// ============================================================
// MEMBER SELECTED
// ============================================================

async function selectContributionMember(
    chatId,
    memberId
) {

    if (
        !isAdmin(chatId)
    ) {

        await sendMessage(
            chatId,
            "🔐 <b>Administrator access required.</b>"
        );

        return;
    }

    try {

        const [members] =
            await db.query(
                `
                SELECT
                    id,
                    full_name
                FROM members
                WHERE id = ?
                AND status = 'active'
                LIMIT 1
                `,
                [memberId]
            );

        if (
            members.length === 0
        ) {

            await sendMessage(
                chatId,
                "❌ Member not found."
            );

            return;
        }

        const member =
            members[0];

        contributionSessions.set(
            String(chatId),
            {
                memberId:
                    member.id,

                memberName:
                    member.full_name
            }
        );

        await sendMessage(
            chatId,
            `👤 <b>${member.full_name}</b>

💵 <b>Enter the contribution amount.</b>

Example:
<code>20</code>

You can enter any valid amount.

❌ Send <code>/cancel</code> to cancel.`
        );

    } catch (error) {

        console.error(
            "Member selection error:",
            error
        );

        await sendMessage(
            chatId,
            "❌ Failed to select member."
        );
    }
}

// ============================================================
// PROCESS CONTRIBUTION AMOUNT
// ============================================================

async function processContributionAmount(
    chatId,
    text
) {

    const session =
        contributionSessions.get(
            String(chatId)
        );

    if (!session) {

        return false;
    }

    if (
        text.trim().toLowerCase() ===
        "/cancel"
    ) {

        contributionSessions.delete(
            String(chatId)
        );

        await sendMessage(
            chatId,
            "❌ Contribution cancelled.",
            {
                reply_markup:
                    JSON.stringify(
                        adminMenu()
                    )
            }
        );

        return true;
    }

    const amount =
        Number(
            text.trim()
        );

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        await sendMessage(
            chatId,
            "❌ Invalid amount.\n\nPlease enter a valid amount such as:\n<code>20</code>"
        );

        return true;
    }

    const memberId =
        session.memberId;

    const memberName =
        session.memberName;

    const today =
        getToday();

    try {

        // ----------------------------------------------------
        // CHECK MEMBER
        // ----------------------------------------------------

        const [members] =
            await db.query(
                `
                SELECT
                    id,
                    full_name
                FROM members
                WHERE id = ?
                AND status = 'active'
                LIMIT 1
                `,
                [memberId]
            );

        if (
            members.length === 0
        ) {

            contributionSessions.delete(
                String(chatId)
            );

            await sendMessage(
                chatId,
                "❌ This member is no longer active."
            );

            return true;
        }

        // ----------------------------------------------------
        // DUPLICATE CHECK
        // ----------------------------------------------------

        const [existing] =
            await db.query(
                `
                SELECT
                    id,
                    amount,
                    contribution_date
                FROM contributions
                WHERE member_id = ?
                AND contribution_date = ?
                LIMIT 1
                `,
                [
                    memberId,
                    today
                ]
            );

        if (
            existing.length > 0
        ) {

            contributionSessions.delete(
                String(chatId)
            );

            await sendMessage(
                chatId,
                `⚠️ <b>Contribution Already Recorded</b>

👤 Member:
<b>${memberName}</b>

💰 Existing amount:
<b>${existing[0].amount} ETB</b>

📅 Date:
<b>${today}</b>

This member already has a contribution recorded for this date.`,
                {
                    reply_markup:
                        JSON.stringify(
                            adminMenu()
                        )
                }
            );

            return true;
        }

        // ----------------------------------------------------
        // INSERT CONTRIBUTION
        // ----------------------------------------------------

        await db.query(
            `
            INSERT INTO contributions
            (
                member_id,
                amount,
                contribution_date,
                recorded_by
            )
            VALUES (?, ?, ?, NULL)
            `,
            [
                memberId,
                amount,
                today
            ]
        );

        contributionSessions.delete(
            String(chatId)
        );

        await sendMessage(
            chatId,
            `✅ <b>Contribution Recorded!</b>

👤 Member:
<b>${memberName}</b>

🆔 Member ID:
<code>${memberId}</code>

💰 Amount:
<b>${amount} ETB</b>

📅 Date:
<b>${today}</b>

🤲 May Allah accept the contribution.`,
            {
                reply_markup:
                    JSON.stringify(
                        adminMenu()
                    )
            }
        );

        return true;

    } catch (error) {

        console.error(
            "Contribution insert error:",
            error
        );

        await sendMessage(
            chatId,
            "❌ Failed to record contribution."
        );

        return true;
    }
}

// ============================================================
// WEEKLY REPORT
// ============================================================

async function weeklyReport(
    chatId,
    reportDate = null
) {

    if (
        !isAdmin(chatId)
    ) {

        await sendMessage(
            chatId,
            "🔐 <b>Administrator access required.</b>"
        );

        return;
    }

    const date =
        reportDate || getToday();

    try {

        const [activeRows] =
            await db.query(`
                SELECT COUNT(*) AS total
                FROM members
                WHERE status = 'active'
            `);

        const totalActive =
            Number(
                activeRows[0].total
            );

        const [paidRows] =
            await db.query(
                `
                SELECT
                    m.id,
                    m.full_name,
                    c.amount
                FROM members m
                INNER JOIN contributions c
                    ON c.member_id = m.id
                WHERE
                    m.status = 'active'
                    AND c.contribution_date = ?
                ORDER BY m.full_name ASC
                `,
                [date]
            );

        const [unpaidRows] =
            await db.query(
                `
                SELECT
                    m.id,
                    m.full_name
                FROM members m
                WHERE
                    m.status = 'active'
                    AND NOT EXISTS (
                        SELECT 1
                        FROM contributions c
                        WHERE
                            c.member_id = m.id
                            AND c.contribution_date = ?
                    )
                ORDER BY m.full_name ASC
                `,
                [date]
            );

        const [totalRows] =
            await db.query(
                `
                SELECT
                    COALESCE(
                        SUM(amount),
                        0
                    ) AS total
                FROM contributions
                WHERE contribution_date = ?
                `,
                [date]
            );

        const totalCollection =
            Number(
                totalRows[0].total
            );

        let text =
            `📊 <b>Weekly Contribution Report</b>\n\n`;

        text +=
            `📅 Date: <b>${date}</b>\n\n`;

        text +=
            `👥 Total active members: <b>${totalActive}</b>\n`;

        text +=
            `✅ Paid: <b>${paidRows.length}</b>\n`;

        text +=
            `❌ Unpaid: <b>${unpaidRows.length}</b>\n`;

        text +=
            `💰 Total collection: <b>${totalCollection.toFixed(2)} ETB</b>\n`;

        if (
            paidRows.length > 0
        ) {

            text +=
                `\n✅ <b>Paid Members</b>\n\n`;

            paidRows.forEach(
                (member, index) => {

                    text +=
                        `${index + 1}. ${member.full_name} — ${member.amount} ETB\n`;
                }
            );
        }

        if (
            unpaidRows.length > 0
        ) {

            text +=
                `\n❌ <b>Unpaid Members</b>\n\n`;

            unpaidRows.forEach(
                (member, index) => {

                    text +=
                        `${index + 1}. ${member.full_name}\n`;
                }
            );
        }

        await sendMessage(
            chatId,
            text,
            {
                reply_markup:
                    JSON.stringify({
                        inline_keyboard: [
                            [
                                {
                                    text: "📅 Monthly Report",
                                    callback_data:
                                        "report_monthly"
                                }
                            ],
                            [
                                {
                                    text: "🔙 Main Menu",
                                    callback_data:
                                        "main_menu"
                                }
                            ]
                        ]
                    })
            }
        );

    } catch (error) {

        console.error(
            "Weekly report error:",
            error
        );

        await sendMessage(
            chatId,
            "❌ Failed to generate weekly report."
        );
    }
}

// ============================================================
// MONTHLY REPORT
// ============================================================

async function monthlyReport(
    chatId,
    reportMonth = null
) {

    if (
        !isAdmin(chatId)
    ) {

        await sendMessage(
            chatId,
            "🔐 <b>Administrator access required.</b>"
        );

        return;
    }

    const month =
        reportMonth ||
        getToday().slice(0, 7);

    if (
        !/^\d{4}-\d{2}$/.test(month)
    ) {

        await sendMessage(
            chatId,
            `❌ Invalid month.

Use:
<code>/report monthly 2026-09</code>`
        );

        return;
    }

    const [
        year,
        monthNumber
    ] =
        month.split("-");

    try {

        const [activeRows] =
            await db.query(`
                SELECT COUNT(*) AS total
                FROM members
                WHERE status = 'active'
            `);

        const totalActive =
            Number(
                activeRows[0].total
            );

        const [daysRows] =
            await db.query(
                `
                SELECT COUNT(
                    DISTINCT contribution_date
                ) AS total_days
                FROM contributions
                WHERE YEAR(contribution_date) = ?
                AND MONTH(contribution_date) = ?
                `,
                [
                    year,
                    monthNumber
                ]
            );

        const contributionDays =
            Number(
                daysRows[0].total_days
            );

        const [totalRows] =
            await db.query(
                `
                SELECT
                    COALESCE(
                        SUM(amount),
                        0
                    ) AS total
                FROM contributions
                WHERE YEAR(contribution_date) = ?
                AND MONTH(contribution_date) = ?
                `,
                [
                    year,
                    monthNumber
                ]
            );

        const totalCollection =
            Number(
                totalRows[0].total
            );

        const [recordRows] =
            await db.query(
                `
                SELECT COUNT(*) AS total
                FROM contributions
                WHERE YEAR(contribution_date) = ?
                AND MONTH(contribution_date) = ?
                `,
                [
                    year,
                    monthNumber
                ]
            );

        const totalRecords =
            Number(
                recordRows[0].total
            );

        const [memberRows] =
            await db.query(
                `
                SELECT
                    m.id,
                    m.full_name,
                    COUNT(c.id) AS contribution_count,
                    COALESCE(
                        SUM(c.amount),
                        0
                    ) AS total_amount
                FROM members m
                LEFT JOIN contributions c
                    ON c.member_id = m.id
                    AND YEAR(c.contribution_date) = ?
                    AND MONTH(c.contribution_date) = ?
                WHERE m.status = 'active'
                GROUP BY
                    m.id,
                    m.full_name
                ORDER BY
                    m.full_name ASC
                `,
                [
                    year,
                    monthNumber
                ]
            );

        const paidMembers =
            memberRows.filter(
                (member) =>
                    Number(
                        member.contribution_count
                    ) > 0
            );

        const unpaidMembers =
            memberRows.filter(
                (member) =>
                    Number(
                        member.contribution_count
                    ) === 0
            );

        let text =
            `📅 <b>Monthly Contribution Report</b>\n\n`;

        text +=
            `🗓 Month: <b>${month}</b>\n\n`;

        text +=
            `👥 Active members: <b>${totalActive}</b>\n`;

        text +=
            `✅ Members who contributed: <b>${paidMembers.length}</b>\n`;

        text +=
            `❌ Members with no contribution: <b>${unpaidMembers.length}</b>\n`;

        text +=
            `📆 Contribution days: <b>${contributionDays}</b>\n`;

        text +=
            `🧾 Contribution records: <b>${totalRecords}</b>\n`;

        text +=
            `💰 Total collection: <b>${totalCollection.toFixed(2)} ETB</b>\n`;

        if (
            paidMembers.length > 0
        ) {

            text +=
                `\n👤 <b>Member Contributions</b>\n\n`;

            paidMembers.forEach(
                (member, index) => {

                    text +=
                        `${index + 1}. <b>${member.full_name}</b>\n`;

                    text +=
                        `   📌 Contributions: ${member.contribution_count}\n`;

                    text +=
                        `   💰 Total: ${Number(member.total_amount).toFixed(2)} ETB\n\n`;
                }
            );
        }

        if (
            unpaidMembers.length > 0
        ) {

            text +=
                `❌ <b>No Contribution This Month</b>\n\n`;

            unpaidMembers.forEach(
                (member, index) => {

                    text +=
                        `${index + 1}. ${member.full_name}\n`;
                }
            );
        }

        await sendMessage(
            chatId,
            text,
            {
                reply_markup:
                    JSON.stringify({
                        inline_keyboard: [
                            [
                                {
                                    text: "📊 Weekly Report",
                                    callback_data:
                                        "report_weekly"
                                }
                            ],
                            [
                                {
                                    text: "🔙 Main Menu",
                                    callback_data:
                                        "main_menu"
                                }
                            ]
                        ]
                    })
            }
        );

    } catch (error) {

        console.error(
            "Monthly report error:",
            error
        );

        await sendMessage(
            chatId,
            "❌ Failed to generate monthly report."
        );
    }
}

// ============================================================
// CALLBACK HANDLER
// ============================================================

async function handleCallbackQuery(
    callbackQuery
) {

    const chatId =
        callbackQuery.message.chat.id;

    const messageId =
        callbackQuery.message.message_id;

    const data =
        callbackQuery.data;

    await answerCallbackQuery(
        callbackQuery.id
    );

    // ========================================================
    // MAIN MENU
    // ========================================================

    if (
        data === "main_menu"
    ) {

        const welcome =
            `🌙 <b>Masjidul-Fatwa Shabab Bot</b> 🌟

Welcome back! 👋

Choose an option below to continue:`;

        await editMessage(
            chatId,
            messageId,
            welcome,
            {
                reply_markup:
                    JSON.stringify(
                        isAdmin(chatId)
                            ? adminMenu()
                            : mainMenu()
                    )
            }
        );

        return;
    }

    // ========================================================
    // MEMBERS
    // ========================================================

    if (
        data === "menu_members"
    ) {

        await showMembers(
            chatId,
            messageId
        );

        return;
    }

    // ========================================================
    // CONTRIBUTION
    // ========================================================

    if (
        data === "menu_contribution"
    ) {

        await showContributionMembers(
            chatId,
            messageId
        );

        return;
    }

    // ========================================================
    // SELECT MEMBER
    // ========================================================

    if (
        data.startsWith(
            "select_member_"
        )
    ) {

        const memberId =
            data.replace(
                "select_member_",
                ""
            );

        await selectContributionMember(
            chatId,
            memberId
        );

        return;
    }

    // ========================================================
    // WEEKLY REPORT
    // ========================================================

    if (
        data === "report_weekly"
    ) {

        await weeklyReport(
            chatId
        );

        return;
    }

    // ========================================================
    // MONTHLY REPORT
    // ========================================================

    if (
        data === "report_monthly"
    ) {

        await monthlyReport(
            chatId
        );

        return;
    }

    // ========================================================
    // HELP
    // ========================================================

    if (
        data === "menu_help"
    ) {

        await showHelp(
            chatId
        );

        return;
    }
}

// ============================================================
// MESSAGE HANDLER
// ============================================================

async function handleMessage(
    message
) {

    if (
        !message ||
        !message.chat
    ) {

        return;
    }

    const chatId =
        message.chat.id;

    const text =
        (message.text || "").trim();

    if (!text) {

        return;
    }

    // ========================================================
    // CONTRIBUTION SESSION
    // ========================================================

    if (
        contributionSessions.has(
            String(chatId)
        )
        &&
        !text.startsWith("/")
    ) {

        await processContributionAmount(
            chatId,
            text
        );

        return;
    }

    // ========================================================
    // /START
    // ========================================================

    if (
        text === "/start"
    ) {

        await showWelcome(
            chatId
        );

        return;
    }

    // ========================================================
    // /HELP
    // ========================================================

    if (
        text === "/help"
    ) {

        await showHelp(
            chatId
        );

        return;
    }

    // ========================================================
    // /CANCEL
    // ========================================================

    if (
        text === "/cancel"
    ) {

        contributionSessions.delete(
            String(chatId)
        );

        await sendMessage(
            chatId,
            "❌ Current operation cancelled.",
            {
                reply_markup:
                    JSON.stringify(
                        isAdmin(chatId)
                            ? adminMenu()
                            : mainMenu()
                    )
            }
        );

        return;
    }

    // ========================================================
    // /MEMBERS
    // ========================================================

    if (
        text === "/members"
    ) {

        await showMembers(
            chatId
        );

        return;
    }

    // ========================================================
    // /ADDCONTRIBUTION
    // ========================================================

    if (
        text.startsWith(
            "/addcontribution"
        )
    ) {

        if (
            !isAdmin(chatId)
        ) {

            await sendMessage(
                chatId,
                "🔐 <b>Administrator access required.</b>"
            );

            return;
        }

        const parts =
            text.split(
                /\s+/
            );

        if (
            parts.length !== 3
        ) {

            await sendMessage(
                chatId,
                `❌ <b>Invalid format.</b>

Use:

<code>/addcontribution MEMBER_ID AMOUNT</code>

Example:

<code>/addcontribution 5 20</code>`
            );

            return;
        }

        const memberId =
            Number(
                parts[1]
            );

        const amount =
            Number(
                parts[2]
            );

        if (
            !Number.isInteger(
                memberId
            )
            ||
            !Number.isFinite(
                amount
            )
            ||
            amount <= 0
        ) {

            await sendMessage(
                chatId,
                "❌ Invalid member ID or amount."
            );

            return;
        }

        const today =
            getToday();

        try {

            const [members] =
                await db.query(
                    `
                    SELECT
                        id,
                        full_name
                    FROM members
                    WHERE id = ?
                    AND status = 'active'
                    LIMIT 1
                    `,
                    [memberId]
                );

            if (
                members.length === 0
            ) {

                await sendMessage(
                    chatId,
                    "❌ Active member not found."
                );

                return;
            }

            const member =
                members[0];

            const [existing] =
                await db.query(
                    `
                    SELECT
                        id,
                        amount,
                        contribution_date
                    FROM contributions
                    WHERE member_id = ?
                    AND contribution_date = ?
                    LIMIT 1
                    `,
                    [
                        memberId,
                        today
                    ]
                );

            if (
                existing.length > 0
            ) {

                await sendMessage(
                    chatId,
                    `⚠️ <b>Contribution Already Recorded</b>

👤 Member:
<b>${member.full_name}</b>

💰 Existing amount:
<b>${existing[0].amount} ETB</b>

📅 Date:
<b>${today}</b>`
                );

                return;
            }

            await db.query(
                `
                INSERT INTO contributions
                (
                    member_id,
                    amount,
                    contribution_date,
                    recorded_by
                )
                VALUES (?, ?, ?, NULL)
                `,
                [
                    memberId,
                    amount,
                    today
                ]
            );

            await sendMessage(
                chatId,
                `✅ <b>Contribution Recorded!</b>

👤 Member:
<b>${member.full_name}</b>

🆔 Member ID:
<code>${member.id}</code>

💰 Amount:
<b>${amount} ETB</b>

📅 Date:
<b>${today}</b>

🤲 May Allah accept the contribution.`,
                {
                    reply_markup:
                        JSON.stringify(
                            adminMenu()
                        )
                }
            );

        } catch (error) {

            console.error(
                "Add contribution error:",
                error
            );

            await sendMessage(
                chatId,
                "❌ Failed to record contribution."
            );
        }

        return;
    }

    // ========================================================
    // /REPORT WEEKLY
    // ========================================================

    if (
        text.startsWith(
            "/report weekly"
        )
    ) {

        const parts =
            text.split(
                /\s+/
            );

        const date =
            parts[2] ||
            getToday();

        await weeklyReport(
            chatId,
            date
        );

        return;
    }

    // ========================================================
    // /REPORT MONTHLY
    // ========================================================

    if (
        text.startsWith(
            "/report monthly"
        )
    ) {

        const parts =
            text.split(
                /\s+/
            );

        const month =
            parts[2] ||
            getToday().slice(0, 7);

        await monthlyReport(
            chatId,
            month
        );

        return;
    }

    // ========================================================
    // /REPORT
    // ========================================================

    if (
        text === "/report"
    ) {

        await sendMessage(
            chatId,
            `📊 <b>Report Commands</b>

<b>Weekly:</b>

/report weekly

Example:
<code>/report weekly 2026-09-24</code>

<b>Monthly:</b>

/report monthly

Example:
<code>/report monthly 2026-09</code>`,
            {
                reply_markup:
                    JSON.stringify({
                        inline_keyboard: [
                            [
                                {
                                    text: "📊 Weekly",
                                    callback_data:
                                        "report_weekly"
                                },
                                {
                                    text: "📅 Monthly",
                                    callback_data:
                                        "report_monthly"
                                }
                            ],
                            [
                                {
                                    text: "🔙 Main Menu",
                                    callback_data:
                                        "main_menu"
                                }
                            ]
                        ]
                    })
            }
        );

        return;
    }

    // ========================================================
    // UNKNOWN COMMAND
    // ========================================================

    if (
        text.startsWith("/")
    ) {

        await sendMessage(
            chatId,
            `❓ <b>Unknown command.</b>

Use <code>/start</code> to open the main menu.`,
            {
                reply_markup:
                    JSON.stringify(
                        isAdmin(chatId)
                            ? adminMenu()
                            : mainMenu()
                    )
            }
        );

        return;
    }
}

// ============================================================
// POLLING
// ============================================================

async function startPolling() {

    console.log(
        "📡 Waiting for Telegram messages..."
    );

    while (polling) {

        try {

            const updates =
                await telegramRequest(
                    "getUpdates",
                    {
                        timeout: 25,
                        offset,
                        allowed_updates:
                            JSON.stringify([
                                "message",
                                "callback_query"
                            ])
                    }
                );

            for (
                const update of updates
            ) {

                offset =
                    update.update_id + 1;

                // --------------------------------------------
                // CALLBACK QUERY
                // --------------------------------------------

                if (
                    update.callback_query
                ) {

                    await handleCallbackQuery(
                        update.callback_query
                    );

                    continue;
                }

                // --------------------------------------------
                // MESSAGE
                // --------------------------------------------

                if (
                    update.message
                ) {

                    await handleMessage(
                        update.message
                    );
                }
            }

        } catch (error) {

            console.error(
                "Polling error:",
                error.message
            );

            await new Promise(
                (resolve) =>
                    setTimeout(
                        resolve,
                        3000
                    )
            );
        }
    }
}

// ============================================================
// START BOT
// ============================================================

async function startBot() {

    console.log(
        "🤖 Telegram bot is starting..."
    );

    console.log(
        `🔐 Authorized administrators: ${adminIds.length}`
    );

    if (!token) {

        console.error(
            "❌ TELEGRAM_BOT_TOKEN is missing from .env"
        );

        process.exit(1);
    }

    try {

        // ----------------------------------------------------
        // TEST TELEGRAM
        // ----------------------------------------------------

        const botInfo =
            await telegramRequest(
                "getMe"
            );

        console.log(
            `✅ Connected to Telegram as @${botInfo.username}`
        );

        // ----------------------------------------------------
        // TEST MYSQL
        // ----------------------------------------------------

        await db.query(
            "SELECT 1 AS test"
        );

        console.log(
            "✅ MySQL connection from Telegram bot is working."
        );

        console.log(
            "✅ Telegram bot is ready."
        );

        // ----------------------------------------------------
        // START POLLING
        // ----------------------------------------------------

        await startPolling();

    } catch (error) {

        console.error(
            "❌ Bot startup failed:"
        );

        console.error(
            error.message
        );

        process.exit(1);
    }
}

// ============================================================
// STOP BOT
// ============================================================

function stopBot() {

    console.log(
        "\n🛑 Stopping Telegram bot..."
    );

    polling = false;
}

process.on(
    "SIGINT",
    stopBot
);

process.on(
    "SIGTERM",
    stopBot
);

// ============================================================
// RUN
// ============================================================

startBot();

