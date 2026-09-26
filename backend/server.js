
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const db = require("./config/db");

const {
    processTelegramUpdate,
    setTelegramWebhook,
    sendContributionNotification
} = require("./telegram");

const app = express();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("❌ JWT_SECRET is missing from .env");
    process.exit(1);
}

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(cors());
app.use(express.json());

/* =========================================================
   JWT AUTHENTICATION
========================================================= */

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    const token =
        authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access denied. Please login first."
        });
    }

    jwt.verify(token, JWT_SECRET, (error, user) => {
        if (error) {
            return res.status(403).json({
                success: false,
                message: "Invalid or expired token."
            });
        }

        req.user = user;

        next();
    });
}

/* =========================================================
   SUPER ADMIN AUTHORIZATION
========================================================= */

function requireSuperAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required."
        });
    }

    if (req.user.role !== "super_admin") {
        return res.status(403).json({
            success: false,
            message: "Super administrator access required."
        });
    }

    next();
}

/* =========================================================
   ADMIN LOGIN
========================================================= */

app.post("/api/auth/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required"
            });
        }

        const [rows] = await db.query(
            `SELECT
                id,
                full_name,
                username,
                password_hash,
                role,
                active
             FROM admins
             WHERE username = ?
             LIMIT 1`,
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        const admin = rows[0];

        // Prevent inactive administrators from logging in
        if (Number(admin.active) !== 1) {
            return res.status(403).json({
                success: false,
                message: "Your administrator account is inactive."
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            admin.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        const token = jwt.sign(
            {
                id: admin.id,
                username: admin.username,
                role: admin.role,
                full_name: admin.full_name
            },
            JWT_SECRET,
            {
                expiresIn: "8h"
            }
        );

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: admin.id,
                full_name: admin.full_name,
                username: admin.username,
                role: admin.role
            }
        });

    } catch (error) {
        console.error(
            "Login error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
});

/* =========================================================
   PUBLIC TEST ROUTES
========================================================= */

app.get("/", (req, res) => {
    res.json({
        message: "Masjidul-Fatwa API is running"
    });
});

app.get("/api/test-db", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT 1 AS result"
        );

        res.json({
            success: true,
            message: "MySQL connected successfully",
            data: rows
        });

    } catch (error) {
        console.error(
            "Database error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message
        });
    }
});

/* =========================================================
   MEMBERS
========================================================= */

// Add member
app.post(
    "/api/members",
    authenticateToken,
    async (req, res) => {
        try {
            const {
                full_name,
                phone,
                telegram_username
            } = req.body;

            if (!full_name) {
                return res.status(400).json({
                    success: false,
                    message: "Full name is required"
                });
            }

            const [result] = await db.query(
                `INSERT INTO members
                (full_name, phone, telegram_username)
                VALUES (?, ?, ?)`,
                [
                    full_name,
                    phone || null,
                    telegram_username || null
                ]
            );

            res.status(201).json({
                success: true,
                message: "Member added successfully",
                member_id: result.insertId
            });

        } catch (error) {
            console.error(
                "Error adding member:",
                error.message
            );

            res.status(500).json({
                success: false,
                message: "Failed to add member",
                error: error.message
            });
        }
    }
);

// Get all members
app.get(
    "/api/members",
    authenticateToken,
    async (req, res) => {
        try {
            const [rows] = await db.query(
                "SELECT * FROM members ORDER BY id DESC"
            );

            res.json({
                success: true,
                data: rows
            });

        } catch (error) {
            console.error(
                "Error getting members:",
                error.message
            );

            res.status(500).json({
                success: false,
                message: "Failed to get members",
                error: error.message
            });
        }
    }
);

// Update member
app.put(
    "/api/members/:id",
    authenticateToken,
    async (req, res) => {
        try {
            const { id } = req.params;

            const {
                full_name,
                phone,
                telegram_username
            } = req.body;

            if (!full_name) {
                return res.status(400).json({
                    success: false,
                    message: "Full name is required"
                });
            }

            const [result] = await db.query(
                `UPDATE members
                 SET full_name = ?,
                     phone = ?,
                     telegram_username = ?
                 WHERE id = ?`,
                [
                    full_name,
                    phone || null,
                    telegram_username || null,
                    id
                ]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Member not found"
                });
            }

            res.json({
                success: true,
                message: "Member updated successfully"
            });

        } catch (error) {
            console.error(
                "Error updating member:",
                error.message
            );

            res.status(500).json({
                success: false,
                message: "Failed to update member",
                error: error.message
            });
        }
    }
);

// Change member status
app.patch(
    "/api/members/:id/status",
    authenticateToken,
    async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (
                !["active", "inactive"].includes(status)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Status must be active or inactive"
                });
            }

            const [result] = await db.query(
                "UPDATE members SET status = ? WHERE id = ?",
                [status, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Member not found"
                });
            }

            res.json({
                success: true,
                message:
                    `Member status changed to ${status}`
            });

        } catch (error) {
            console.error(
                "Error changing member status:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to change member status",
                error: error.message
            });
        }
    }
);

// Search members
app.get(
    "/api/members/search",
    authenticateToken,
    async (req, res) => {
        try {
            const { q } = req.query;

            if (!q) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Search query is required"
                });
            }

            const searchTerm = `%${q}%`;

            const [rows] = await db.query(
                `SELECT *
                 FROM members
                 WHERE full_name LIKE ?
                    OR phone LIKE ?
                    OR telegram_username LIKE ?
                 ORDER BY id DESC`,
                [
                    searchTerm,
                    searchTerm,
                    searchTerm
                ]
            );

            res.json({
                success: true,
                data: rows
            });

        } catch (error) {
            console.error(
                "Error searching members:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to search members",
                error: error.message
            });
        }
    }
);

/* =========================================================
   CONTRIBUTIONS
========================================================= */

// Add contribution
app.post(
    "/api/contributions",
    authenticateToken,
    async (req, res) => {
        try {
            const {
                member_id,
                amount,
                contribution_date
            } = req.body;

            if (
                !member_id ||
                !amount ||
                !contribution_date
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Member, amount, and contribution date are required"
                });
            }

            const [result] = await db.query(
                `INSERT INTO contributions
                (member_id, amount, contribution_date)
                VALUES (?, ?, ?)`,
                [
                    member_id,
                    amount,
                    contribution_date
                ]
            );

            await sendContributionNotification(
    member_id,
    amount,
    contribution_date
);

            res.status(201).json({
                success: true,
                message:
                    "Contribution added successfully",
                contribution_id: result.insertId
            });

        } catch (error) {
            console.error(
                "Error adding contribution:",
                error.message
            );

            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    success: false,
                    message:
                        "This member has already contributed on this date"
                });
            }

            res.status(500).json({
                success: false,
                message:
                    "Failed to add contribution",
                error: error.message
            });
        }
    }
);

// Get contributions
app.get(
    "/api/contributions",
    authenticateToken,
    async (req, res) => {
        try {
            const [rows] = await db.query(
                `SELECT
                    contributions.id,
                    contributions.member_id,
                    members.full_name,
                    contributions.amount,
                    contributions.contribution_date,
                    contributions.created_at
                 FROM contributions
                 INNER JOIN members
                    ON contributions.member_id = members.id
                 ORDER BY
                    contributions.contribution_date DESC,
                    contributions.id DESC`
            );

            res.json({
                success: true,
                data: rows
            });

        } catch (error) {
            console.error(
                "Error getting contributions:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to get contributions",
                error: error.message
            });
        }
    }
);

/* =========================================================
   REPORTS
========================================================= */

// Weekly report
app.get(
    "/api/reports/weekly",
    authenticateToken,
    async (req, res) => {
        try {
            const { date } = req.query;

            if (!date) {
                return res.status(400).json({
                    success: false,
                    message: "Date is required"
                });
            }

            const [rows] = await db.query(
                `SELECT
                    members.id AS member_id,
                    members.full_name,
                    members.phone,
                    members.telegram_username,
                    members.status,
                    contributions.amount,
                    contributions.contribution_date
                 FROM members
                 LEFT JOIN contributions
                    ON members.id = contributions.member_id
                    AND contributions.contribution_date = ?
                 WHERE members.status = 'active'
                 ORDER BY members.full_name ASC`,
                [date]
            );

            const paidMembers =
                rows.filter(
                    row => row.amount !== null
                );

            const unpaidMembers =
                rows.filter(
                    row => row.amount === null
                );

            const totalCollection =
                paidMembers.reduce(
                    (total, member) =>
                        total + Number(member.amount),
                    0
                );

            res.json({
                success: true,
                date,
                total_members: rows.length,
                paid_count: paidMembers.length,
                unpaid_count:
                    unpaidMembers.length,
                total_collection:
                    totalCollection,
                paid_members: paidMembers,
                unpaid_members: unpaidMembers
            });

        } catch (error) {
            console.error(
                "Error generating weekly report:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to generate weekly report",
                error: error.message
            });
        }
    }
);

// Monthly report
app.get(
    "/api/reports/monthly",
    authenticateToken,
    async (req, res) => {
        try {
            const { year, month } = req.query;

            if (!year || !month) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Year and month are required"
                });
            }

            const monthNumber = Number(month);

            if (
                monthNumber < 1 ||
                monthNumber > 12
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Month must be between 1 and 12"
                });
            }

            const [rows] = await db.query(
                `SELECT
                    contributions.id,
                    contributions.member_id,
                    members.full_name,
                    contributions.amount,
                    contributions.contribution_date
                 FROM contributions
                 INNER JOIN members
                    ON contributions.member_id = members.id
                 WHERE YEAR(contributions.contribution_date) = ?
                   AND MONTH(contributions.contribution_date) = ?
                 ORDER BY
                    contributions.contribution_date ASC`,
                [
                    year,
                    monthNumber
                ]
            );

            const totalCollection =
                rows.reduce(
                    (total, contribution) =>
                        total +
                        Number(
                            contribution.amount
                        ),
                    0
                );

            res.json({
                success: true,
                year: Number(year),
                month: monthNumber,
                contribution_count:
                    rows.length,
                total_collection:
                    totalCollection,
                contributions: rows
            });

        } catch (error) {
            console.error(
                "Error generating monthly report:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to generate monthly report",
                error: error.message
            });
        }
    }
);

// Member report
app.get(
    "/api/reports/member/:id",
    authenticateToken,
    async (req, res) => {
        try {
            const { id } = req.params;

            const [memberRows] =
                await db.query(
                    `SELECT
                        id,
                        full_name,
                        phone,
                        telegram_username,
                        status
                     FROM members
                     WHERE id = ?`,
                    [id]
                );

            if (memberRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Member not found"
                });
            }

            const [contributions] =
                await db.query(
                    `SELECT
                        id,
                        amount,
                        contribution_date,
                        created_at
                     FROM contributions
                     WHERE member_id = ?
                     ORDER BY contribution_date DESC`,
                    [id]
                );

            const totalCollection =
                contributions.reduce(
                    (total, contribution) =>
                        total +
                        Number(
                            contribution.amount
                        ),
                    0
                );

            res.json({
                success: true,
                member: memberRows[0],
                contribution_count:
                    contributions.length,
                total_collection:
                    totalCollection,
                contributions
            });

        } catch (error) {
            console.error(
                "Error generating member report:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to generate member report",
                error: error.message
            });
        }
    }
);

/* =========================================================
   DASHBOARD
========================================================= */

app.get(
    "/api/dashboard",
    authenticateToken,
    async (req, res) => {
        try {
            const [memberRows] =
                await db.query(
                    `SELECT COUNT(*) AS total_active_members
                     FROM members
                     WHERE status = 'active'`
                );

            const [totalRows] =
                await db.query(
                    `SELECT
                        COALESCE(
                            SUM(amount),
                            0
                        ) AS total_collection
                     FROM contributions`
                );

            const [weekRows] =
                await db.query(
                    `SELECT
                        COALESCE(
                            SUM(amount),
                            0
                        ) AS weekly_collection,
                        COUNT(*) AS weekly_contributions
                     FROM contributions
                     WHERE YEARWEEK(
                        contribution_date,
                        1
                     ) = YEARWEEK(
                        CURDATE(),
                        1
                     )`
                );

            const [monthRows] =
                await db.query(
                    `SELECT
                        COALESCE(
                            SUM(amount),
                            0
                        ) AS monthly_collection,
                        COUNT(*) AS monthly_contributions
                     FROM contributions
                     WHERE YEAR(contribution_date)
                        = YEAR(CURDATE())
                       AND MONTH(contribution_date)
                        = MONTH(CURDATE())`
                );

            const [paidRows] =
                await db.query(
                    `SELECT COUNT(*) AS paid_members_this_week
                     FROM members
                     INNER JOIN contributions
                        ON members.id =
                           contributions.member_id
                     WHERE members.status = 'active'
                       AND YEARWEEK(
                           contributions.contribution_date,
                           1
                       ) =
                           YEARWEEK(
                               CURDATE(),
                               1
                           )`
                );

            const [unpaidRows] =
                await db.query(
                    `SELECT COUNT(*) AS unpaid_members_this_week
                     FROM members
                     WHERE status = 'active'
                       AND id NOT IN (
                           SELECT member_id
                           FROM contributions
                           WHERE YEARWEEK(
                               contribution_date,
                               1
                           ) =
                               YEARWEEK(
                                   CURDATE(),
                                   1
                               )
                       )`
                );

            const [recentContributionRows] =
                await db.query(
                    `SELECT
                        contributions.id,
                        members.full_name,
                        contributions.amount,
                        contributions.contribution_date
                     FROM contributions
                     INNER JOIN members
                        ON contributions.member_id =
                           members.id
                     ORDER BY
                        contributions.contribution_date DESC,
                        contributions.id DESC
                     LIMIT 5`
                );

            const [collectionTrendRows] =
    await db.query(
        `WITH RECURSIVE weeks AS (
            SELECT
                DATE_SUB(
                    CURDATE(),
                    INTERVAL WEEKDAY(CURDATE()) DAY
                ) - INTERVAL 5 WEEK AS week_start

            UNION ALL

            SELECT
                DATE_ADD(
                    week_start,
                    INTERVAL 1 WEEK
                )
            FROM weeks
            WHERE week_start <
                DATE_SUB(
                    CURDATE(),
                    INTERVAL WEEKDAY(CURDATE()) DAY
                )
        )

        SELECT
            weeks.week_start,
            COALESCE(
                SUM(contributions.amount),
                0
            ) AS total_collection

        FROM weeks

        LEFT JOIN contributions
            ON contributions.contribution_date >=
                weeks.week_start
            AND contributions.contribution_date <
                DATE_ADD(
                    weeks.week_start,
                    INTERVAL 1 WEEK
                )

        GROUP BY
            weeks.week_start

        ORDER BY
            weeks.week_start ASC`
    );
                console.log(
    "DASHBOARD DEBUG:",
    {
        recentCount:
            recentContributionRows.length,

        trendCount:
            collectionTrendRows.length
    }
);

            res.json({
                success: true,
                data: {
                    total_active_members:
                        memberRows[0]
                            .total_active_members,

                    total_collection:
                        Number(
                            totalRows[0]
                                .total_collection
                        ),

                    weekly_collection:
                        Number(
                            weekRows[0]
                                .weekly_collection
                        ),

                    weekly_contributions:
                        weekRows[0]
                            .weekly_contributions,

                    monthly_collection:
                        Number(
                            monthRows[0]
                                .monthly_collection
                        ),

                    monthly_contributions:
                        monthRows[0]
                            .monthly_contributions,

                    paid_members_this_week:
                        paidRows[0]
                            .paid_members_this_week,

                    unpaid_members_this_week:
                        unpaidRows[0]
                            .unpaid_members_this_week,

                    recent_contributions:
                        recentContributionRows,

                    collection_trend:
                        collectionTrendRows.map(
                            (row) => ({
                                week_start:
                                    row.week_start,

                                total_collection:
                                    Number(
                                        row.total_collection
                                    )
                            })
                        )
                }
            });

        } catch (error) {
            console.error(
                "Error getting dashboard summary:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to get dashboard summary"
            });
        }
    }
);
/* =========================================================
   SETTINGS
========================================================= */

// Get contribution amount
app.get(
    "/api/settings/contribution-amount",
    authenticateToken,
    async (req, res) => {
        try {
            const [rows] =
                await db.query(
                    `SELECT setting_value
                     FROM settings
                     WHERE setting_name =
                       'weekly_contribution_amount'
                     LIMIT 1`
                );

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Contribution amount setting not found"
                });
            }

            res.json({
                success: true,
                amount:
                    Number(
                        rows[0].setting_value
                    )
            });

        } catch (error) {
            console.error(
                "Error getting contribution amount:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to get contribution amount"
            });
        }
    }
);

// Update contribution amount
// SUPER ADMIN ONLY
app.put(
    "/api/settings/contribution-amount",
    authenticateToken,
    requireSuperAdmin,
    async (req, res) => {
        try {
            const { amount } = req.body;

            if (
                amount === undefined ||
                amount === null ||
                amount === ""
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Contribution amount is required"
                });
            }

            const numericAmount = Number(amount);

            if (
                Number.isNaN(numericAmount) ||
                numericAmount <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Contribution amount must be greater than 0"
                });
            }

            const [result] =
                await db.query(
                    `UPDATE settings
                     SET setting_value = ?
                     WHERE setting_name =
                       'weekly_contribution_amount'`,
                    [numericAmount]
                );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Contribution amount setting not found"
                });
            }

            res.json({
                success: true,
                message:
                    "Contribution amount updated successfully",
                amount: numericAmount
            });

        } catch (error) {
            console.error(
                "Error updating contribution amount:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to update contribution amount"
            });
        }
    }
);

/* =========================================================
   ADMIN MANAGEMENT
   Super Admin only
========================================================= */

// GET ALL ADMINS
app.get(
    "/api/admins",
    authenticateToken,
    requireSuperAdmin,
    async (req, res) => {
        try {
            const [admins] = await db.query(
                `SELECT
                    id,
                    full_name,
                    username,
                    role,
                    active,
                    created_at
                 FROM admins
                 ORDER BY id DESC`
            );

            res.json({
                success: true,
                admins
            });

        } catch (error) {
            console.error(
                "Get admins error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to load administrators."
            });
        }
    }
);

// CREATE NEW ADMIN
app.post(
    "/api/admins",
    authenticateToken,
    requireSuperAdmin,
    async (req, res) => {
        try {
            const {
                full_name,
                username,
                password,
                role
            } = req.body;

            if (
                !full_name ||
                !username ||
                !password
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Full name, username and password are required."
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Password must be at least 6 characters."
                });
            }

            const adminRole =
                role === "super_admin"
                    ? "super_admin"
                    : "admin";

            // Check duplicate username
            const [existing] =
                await db.query(
                    "SELECT id FROM admins WHERE username = ?",
                    [username.trim()]
                );

            if (existing.length > 0) {
                return res.status(409).json({
                    success: false,
                    message:
                        "This username is already in use."
                });
            }

            const passwordHash =
                await bcrypt.hash(
                    password,
                    10
                );

            const [result] =
                await db.query(
                    `INSERT INTO admins
                        (
                            full_name,
                            username,
                            password_hash,
                            role
                        )
                     VALUES (?, ?, ?, ?)`,
                    [
                        full_name.trim(),
                        username.trim(),
                        passwordHash,
                        adminRole
                    ]
                );

            res.status(201).json({
                success: true,
                message:
                    "Administrator created successfully.",
                admin: {
                    id: result.insertId,
                    full_name:
                        full_name.trim(),
                    username:
                        username.trim(),
                    role: adminRole
                }
            });

        } catch (error) {
            console.error(
                "Create admin error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to create administrator."
            });
        }
    }
);

// UPDATE ADMIN
app.put(
    "/api/admins/:id",
    authenticateToken,
    requireSuperAdmin,
    async (req, res) => {
        try {
            const adminId =
                Number(req.params.id);

            const {
                full_name,
                username,
                password,
                role
            } = req.body;

            if (!adminId) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid administrator ID."
                });
            }

            if (
                !full_name ||
                !username
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Full name and username are required."
                });
            }

            // Get existing admin
            const [existingAdmin] =
                await db.query(
                    "SELECT * FROM admins WHERE id = ?",
                    [adminId]
                );

            if (existingAdmin.length === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Administrator not found."
                });
            }

            // Prevent changing the logged-in
            // super admin into a normal admin
            if (
                adminId === req.user.id &&
                role !== "super_admin"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "You cannot remove your own Super Admin role."
                });
            }

            // Check username belongs to another admin
            const [duplicateUsername] =
                await db.query(
                    `SELECT id
                     FROM admins
                     WHERE username = ?
                     AND id != ?`,
                    [
                        username.trim(),
                        adminId
                    ]
                );

            if (duplicateUsername.length > 0) {
                return res.status(409).json({
                    success: false,
                    message:
                        "This username is already in use."
                });
            }

            const newRole =
                role === "super_admin"
                    ? "super_admin"
                    : "admin";

            let query;
            let params;

            if (
                password &&
                password.trim() !== ""
            ) {
                if (password.length < 6) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Password must be at least 6 characters."
                    });
                }

                const passwordHash =
                    await bcrypt.hash(
                        password,
                        10
                    );

                query = `
                    UPDATE admins
                    SET
                        full_name = ?,
                        username = ?,
                        password_hash = ?,
                        role = ?
                    WHERE id = ?
                `;

                params = [
                    full_name.trim(),
                    username.trim(),
                    passwordHash,
                    newRole,
                    adminId
                ];

            } else {
                query = `
                    UPDATE admins
                    SET
                        full_name = ?,
                        username = ?,
                        role = ?
                    WHERE id = ?
                `;

                params = [
                    full_name.trim(),
                    username.trim(),
                    newRole,
                    adminId
                ];
            }

            const [result] =
                await db.query(
                    query,
                    params
                );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Administrator was not updated."
                });
            }

            res.json({
                success: true,
                message:
                    "Administrator updated successfully."
            });

        } catch (error) {
            console.error(
                "Update admin error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to update administrator."
            });
        }
    }
);

// ACTIVATE / DEACTIVATE ADMIN
app.patch(
    "/api/admins/:id/status",
    authenticateToken,
    requireSuperAdmin,
    async (req, res) => {
        try {
            const adminId =
                Number(req.params.id);

            const { active } =
                req.body;

            if (!adminId) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid administrator ID."
                });
            }

            if (
                typeof active !== "boolean"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Active status must be true or false."
                });
            }

            // Prevent disabling yourself
            if (
                adminId === req.user.id
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "You cannot deactivate your own account."
                });
            }

            // Make sure admin exists
            const [admins] =
                await db.query(
                    "SELECT id, role, active FROM admins WHERE id = ?",
                    [adminId]
                );

            if (admins.length === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Administrator not found."
                });
            }

            const [result] =
                await db.query(
                    `UPDATE admins
                     SET active = ?
                     WHERE id = ?`,
                    [
                        active ? 1 : 0,
                        adminId
                    ]
                );

            if (
                result.affectedRows === 0
            ) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Administrator status was not updated."
                });
            }

            res.json({
                success: true,
                message: active
                    ? "Administrator activated successfully."
                    : "Administrator deactivated successfully.",
                active: active ? 1 : 0
            });

        } catch (error) {
            console.error(
                "Update admin status error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to update administrator status."
            });
        }
    }
);

/* =========================================================
   TELEGRAM WEBHOOK STATUS - TEMPORARY
========================================================= */

app.get("/api/telegram/status", async (req, res) => {
    try {
        const token = process.env.TELEGRAM_BOT_TOKEN;

        if (!token) {
            return res.status(500).json({
                success: false,
                message: "TELEGRAM_BOT_TOKEN is missing"
            });
        }

        const response = await fetch(
            `https://api.telegram.org/bot${token}/getWebhookInfo`
        );

        const result = await response.json();

        res.json({
            success: result.ok,
            webhook: result.result
                ? {
                      url: result.result.url,
                      has_custom_certificate:
                          result.result.has_custom_certificate,
                      pending_update_count:
                          result.result.pending_update_count,
                      last_error_date:
                          result.result.last_error_date,
                      last_error_message:
                          result.result.last_error_message
                  }
                : null
        });

    } catch (error) {
        console.error(
            "Telegram status error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/* =========================================================
   TELEGRAM BOT WEBHOOK
========================================================= */

app.post("/api/telegram/webhook", async (req, res) => {
    try {
        await processTelegramUpdate(req.body);

        res.sendStatus(200);

    } catch (error) {
        console.error(
            "Telegram webhook error:",
            error.message
        );

        res.sendStatus(500);
    }
});

/* =========================================================
   SERVER
========================================================= */

const PORT =
    process.env.PORT || 5000;

    /* =========================================================
   TELEGRAM WEBHOOK CONFIGURATION
========================================================= */

if (process.env.TELEGRAM_BOT_TOKEN) {
    const webhookUrl =
        "https://masjidul-fatwa-l6ao.vercel.app/api/telegram/webhook";

    setTelegramWebhook(webhookUrl);
}

/*
   Vercel needs access to the Express app.
   Export it without removing local development support.
*/
module.exports = app;

/*
   Start the normal HTTP server only when
   running directly with Node locally.
*/
if (require.main === module) {
    app.listen(
        PORT,
        () => {
            console.log(
                `Server running on http://localhost:${PORT}`
            );
        }
    );
}