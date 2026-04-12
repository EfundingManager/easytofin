/**
 * manage-staff-phones.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * CLI script to list and update phone numbers for Admin, Manager, and Staff
 * users in the `phoneUsers` table.
 *
 * These roles require a registered phone number to complete phone 2FA at login.
 *
 * USAGE
 * ──────────────────────────────────────────────────────────────────────────────
 *
 *  List all privileged users and their phone status:
 *    DATABASE_URL=<url> npx tsx scripts/manage-staff-phones.ts list
 *
 *  Set / update a phone number for a specific user by ID:
 *    DATABASE_URL=<url> npx tsx scripts/manage-staff-phones.ts set <userId> <phone>
 *
 *  Set / update a phone number for a user by email:
 *    DATABASE_URL=<url> npx tsx scripts/manage-staff-phones.ts set-by-email <email> <phone>
 *
 *  Remove (clear) a phone number for a specific user by ID:
 *    DATABASE_URL=<url> npx tsx scripts/manage-staff-phones.ts clear <userId>
 *
 *  Bulk update from a JSON file (see format below):
 *    DATABASE_URL=<url> npx tsx scripts/manage-staff-phones.ts bulk <path/to/users.json>
 *
 * BULK JSON FORMAT
 * ──────────────────────────────────────────────────────────────────────────────
 *  [
 *    { "id": 1, "phone": "+353871234567" },
 *    { "email": "manager@example.com", "phone": "+447911123456" }
 *  ]
 *  Either "id" or "email" must be provided per entry.
 *
 * PHONE FORMAT
 * ──────────────────────────────────────────────────────────────────────────────
 *  Use E.164 international format: +<country_code><number>
 *  Examples: +353871234567 (Ireland), +447911123456 (UK), +12125551234 (US)
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { phoneUsers } from "../drizzle/schema";
import { eq, inArray } from "drizzle-orm";
import { readFileSync } from "fs";
import { resolve } from "path";
import dotenv from "dotenv";

dotenv.config();

// ── Constants ─────────────────────────────────────────────────────────────────

const PRIVILEGED_ROLES = ["admin", "manager", "staff"] as const;
type PrivilegedRole = (typeof PRIVILEGED_ROLES)[number];

const ROLE_COLORS: Record<string, string> = {
  admin:   "\x1b[31m", // red
  manager: "\x1b[33m", // yellow
  staff:   "\x1b[36m", // cyan
  reset:   "\x1b[0m",
  green:   "\x1b[32m",
  bold:    "\x1b[1m",
  dim:     "\x1b[2m",
};

// E.164 phone format validator
const E164_REGEX = /^\+[1-9]\d{6,14}$/;

// ── Helpers ───────────────────────────────────────────────────────────────────

function colorize(text: string, color: string): string {
  return `${ROLE_COLORS[color] ?? ""}${text}${ROLE_COLORS.reset}`;
}

function validatePhone(phone: string): void {
  if (!E164_REGEX.test(phone)) {
    console.error(
      colorize(
        `\n✗ Invalid phone format: "${phone}"\n` +
        `  Use E.164 international format, e.g. +353871234567 (IE), +447911123456 (UK)\n`,
        "admin"
      )
    );
    process.exit(1);
  }
}

function maskPhone(phone: string): string {
  if (phone.length <= 4) return "****";
  const last4 = phone.slice(-4);
  const prefix = phone.slice(0, Math.min(3, phone.length - 4));
  const stars = "*".repeat(Math.max(0, phone.length - 4 - prefix.length));
  return `${prefix}${stars}${last4}`;
}

function printSeparator(): void {
  console.log(colorize("─".repeat(72), "dim"));
}

// ── Database connection ───────────────────────────────────────────────────────

async function getDb() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error(colorize("\n✗ DATABASE_URL environment variable is not set.\n", "admin"));
    process.exit(1);
  }
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle({ client: connection });
  return { db, connection };
}

// ── Commands ──────────────────────────────────────────────────────────────────

/**
 * LIST — Show all Admin, Manager, and Staff users with their phone status.
 */
async function cmdList() {
  const { db, connection } = await getDb();

  try {
    const rows = await db
      .select({
        id:          phoneUsers.id,
        name:        phoneUsers.name,
        email:       phoneUsers.email,
        phone:       phoneUsers.phone,
        role:        phoneUsers.role,
        loginMethod: phoneUsers.loginMethod,
        lastSignedIn: phoneUsers.lastSignedIn,
      })
      .from(phoneUsers)
      .where(inArray(phoneUsers.role, [...PRIVILEGED_ROLES]));

    console.log();
    console.log(colorize("  EASYTOFIN — Privileged Users Phone Status", "bold"));
    printSeparator();

    if (rows.length === 0) {
      console.log(colorize("  No Admin, Manager, or Staff users found in phoneUsers table.", "dim"));
      console.log();
      return;
    }

    // Group by role
    const byRole: Record<PrivilegedRole, typeof rows> = {
      admin:   rows.filter((r) => r.role === "admin"),
      manager: rows.filter((r) => r.role === "manager"),
      staff:   rows.filter((r) => r.role === "staff"),
    };

    let missingPhone = 0;

    for (const role of PRIVILEGED_ROLES) {
      const group = byRole[role];
      if (group.length === 0) continue;

      console.log(colorize(`  ${role.toUpperCase()} (${group.length})`, role));
      printSeparator();

      for (const user of group) {
        const hasPhone = !!user.phone;
        const phoneDisplay = hasPhone
          ? colorize(`✓ ${maskPhone(user.phone!)}`, "green")
          : colorize("✗ NOT SET  ← needs phone for 2FA", "admin");

        if (!hasPhone) missingPhone++;

        const lastLogin = user.lastSignedIn
          ? user.lastSignedIn.toISOString().replace("T", " ").slice(0, 19)
          : "never";

        console.log(
          `  ID: ${String(user.id).padEnd(5)} ` +
          `Name: ${(user.name ?? "—").padEnd(24)} ` +
          `Email: ${(user.email ?? "—").padEnd(32)} ` +
          `Phone: ${phoneDisplay}`
        );
        console.log(
          `         Login: ${(user.loginMethod ?? "—").padEnd(12)} ` +
          `Last sign-in: ${lastLogin}`
        );
        console.log();
      }
    }

    printSeparator();
    console.log(
      `  Total privileged users: ${colorize(String(rows.length), "bold")}  |  ` +
      `Missing phone: ${missingPhone > 0 ? colorize(String(missingPhone), "admin") : colorize("0", "green")}`
    );

    if (missingPhone > 0) {
      console.log();
      console.log(colorize("  ⚠  Users without a phone number cannot complete 2FA login.", "admin"));
      console.log(colorize("     Run: npx tsx scripts/manage-staff-phones.ts set <userId> <phone>", "dim"));
    }
    console.log();
  } finally {
    await connection.end();
  }
}

/**
 * SET — Set or update a phone number for a user by their numeric ID.
 */
async function cmdSet(userId: number, phone: string) {
  validatePhone(phone);

  const { db, connection } = await getDb();

  try {
    // Fetch the user first to confirm they exist and have a privileged role
    const [user] = await db
      .select()
      .from(phoneUsers)
      .where(eq(phoneUsers.id, userId))
      .limit(1);

    if (!user) {
      console.error(colorize(`\n✗ No user found with ID ${userId}.\n`, "admin"));
      process.exit(1);
    }

    if (!PRIVILEGED_ROLES.includes(user.role as PrivilegedRole)) {
      console.error(
        colorize(
          `\n⚠  User ID ${userId} has role "${user.role}" which does not require 2FA.\n` +
          `   Only admin, manager, and staff roles need a phone number.\n`,
          "admin"
        )
      );
      // Allow it anyway with a warning — the user may be promoted later
    }

    const oldPhone = user.phone ?? "(none)";

    await db
      .update(phoneUsers)
      .set({ phone, updatedAt: new Date() })
      .where(eq(phoneUsers.id, userId));

    console.log();
    console.log(colorize("  ✓ Phone number updated successfully", "green"));
    printSeparator();
    console.log(`  User ID    : ${user.id}`);
    console.log(`  Name       : ${user.name ?? "—"}`);
    console.log(`  Email      : ${user.email ?? "—"}`);
    console.log(`  Role       : ${colorize(user.role, user.role as string)}`);
    console.log(`  Old phone  : ${colorize(oldPhone, "dim")}`);
    console.log(`  New phone  : ${colorize(phone, "green")}`);
    console.log();
  } finally {
    await connection.end();
  }
}

/**
 * SET-BY-EMAIL — Set or update a phone number for a user by their email address.
 */
async function cmdSetByEmail(email: string, phone: string) {
  validatePhone(phone);

  const { db, connection } = await getDb();

  try {
    const [user] = await db
      .select()
      .from(phoneUsers)
      .where(eq(phoneUsers.email, email))
      .limit(1);

    if (!user) {
      console.error(colorize(`\n✗ No user found with email "${email}".\n`, "admin"));
      process.exit(1);
    }

    await cmdSet(user.id, phone);
  } finally {
    await connection.end();
  }
}

/**
 * CLEAR — Remove (nullify) the phone number for a user by ID.
 */
async function cmdClear(userId: number) {
  const { db, connection } = await getDb();

  try {
    const [user] = await db
      .select()
      .from(phoneUsers)
      .where(eq(phoneUsers.id, userId))
      .limit(1);

    if (!user) {
      console.error(colorize(`\n✗ No user found with ID ${userId}.\n`, "admin"));
      process.exit(1);
    }

    await db
      .update(phoneUsers)
      .set({ phone: null, updatedAt: new Date() })
      .where(eq(phoneUsers.id, userId));

    console.log();
    console.log(colorize("  ✓ Phone number cleared", "green"));
    console.log(`  User ID : ${user.id}  |  Name: ${user.name ?? "—"}  |  Role: ${user.role}`);
    console.log(colorize("  ⚠  This user will not be able to complete 2FA until a phone is set.", "admin"));
    console.log();
  } finally {
    await connection.end();
  }
}

/**
 * BULK — Update phone numbers from a JSON file.
 *
 * JSON format:
 *   [ { "id": 1, "phone": "+353871234567" }, { "email": "x@y.com", "phone": "+447..." } ]
 */
async function cmdBulk(filePath: string) {
  const absPath = resolve(process.cwd(), filePath);

  let entries: Array<{ id?: number; email?: string; phone: string }>;
  try {
    const raw = readFileSync(absPath, "utf-8");
    entries = JSON.parse(raw);
  } catch (err: any) {
    console.error(colorize(`\n✗ Failed to read or parse JSON file: ${err.message}\n`, "admin"));
    process.exit(1);
  }

  if (!Array.isArray(entries) || entries.length === 0) {
    console.error(colorize("\n✗ JSON file must be a non-empty array.\n", "admin"));
    process.exit(1);
  }

  const { db, connection } = await getDb();

  console.log();
  console.log(colorize(`  BULK UPDATE — ${entries.length} entries from ${absPath}`, "bold"));
  printSeparator();

  let successCount = 0;
  let failCount = 0;

  try {
    for (const entry of entries) {
      const { id, email, phone } = entry;

      if (!phone) {
        console.error(colorize(`  ✗ Skipping entry (missing "phone"): ${JSON.stringify(entry)}`, "admin"));
        failCount++;
        continue;
      }

      if (!E164_REGEX.test(phone)) {
        console.error(colorize(`  ✗ Invalid phone "${phone}" for entry: ${JSON.stringify(entry)}`, "admin"));
        failCount++;
        continue;
      }

      let user: typeof phoneUsers.$inferSelect | undefined;

      if (id !== undefined) {
        [user] = await db
          .select()
          .from(phoneUsers)
          .where(eq(phoneUsers.id, id))
          .limit(1);
      } else if (email) {
        [user] = await db
          .select()
          .from(phoneUsers)
          .where(eq(phoneUsers.email, email))
          .limit(1);
      } else {
        console.error(colorize(`  ✗ Entry must have "id" or "email": ${JSON.stringify(entry)}`, "admin"));
        failCount++;
        continue;
      }

      if (!user) {
        const identifier = id !== undefined ? `ID ${id}` : `email "${email}"`;
        console.error(colorize(`  ✗ User not found for ${identifier}`, "admin"));
        failCount++;
        continue;
      }

      await db
        .update(phoneUsers)
        .set({ phone, updatedAt: new Date() })
        .where(eq(phoneUsers.id, user.id));

      console.log(
        colorize("  ✓", "green") +
        ` ID: ${String(user.id).padEnd(5)} ` +
        `Name: ${(user.name ?? "—").padEnd(24)} ` +
        `Role: ${colorize(user.role.padEnd(8), user.role as string)} ` +
        `Phone: ${colorize(phone, "green")}`
      );
      successCount++;
    }
  } finally {
    await connection.end();
  }

  printSeparator();
  console.log(
    `  Done. ` +
    `${colorize(String(successCount), "green")} updated, ` +
    `${failCount > 0 ? colorize(String(failCount), "admin") : "0"} failed.`
  );
  console.log();
}

// ── Help ──────────────────────────────────────────────────────────────────────

function printHelp() {
  console.log(`
${colorize("  EASYTOFIN — Manage Staff Phone Numbers", "bold")}
${colorize("  ─────────────────────────────────────────────────────────────────────", "dim")}

  Manage phone numbers for Admin, Manager, and Staff users.
  These roles require a registered phone number to complete phone 2FA at login.

  ${colorize("COMMANDS", "bold")}

    list
      Show all privileged users and their phone registration status.

    set <userId> <phone>
      Set or update the phone number for a user by their numeric ID.

    set-by-email <email> <phone>
      Set or update the phone number for a user by their email address.

    clear <userId>
      Remove (clear) the phone number for a user by their numeric ID.

    bulk <path/to/file.json>
      Bulk-update phone numbers from a JSON file.
      JSON format: [{ "id": 1, "phone": "+353..." }, { "email": "x@y.com", "phone": "+44..." }]

  ${colorize("PHONE FORMAT", "bold")}
    Use E.164 international format: +<country_code><number>
    Examples:  +353871234567  (Ireland)
               +447911123456  (United Kingdom)
               +12125551234   (United States)

  ${colorize("EXAMPLES", "bold")}
    DATABASE_URL=<url> npx tsx scripts/manage-staff-phones.ts list
    DATABASE_URL=<url> npx tsx scripts/manage-staff-phones.ts set 3 +353871234567
    DATABASE_URL=<url> npx tsx scripts/manage-staff-phones.ts set-by-email admin@easytofin.com +447911123456
    DATABASE_URL=<url> npx tsx scripts/manage-staff-phones.ts clear 3
    DATABASE_URL=<url> npx tsx scripts/manage-staff-phones.ts bulk ./phones.json
`);
}

// ── Entry point ───────────────────────────────────────────────────────────────

async function main() {
  const [, , command, ...args] = process.argv;

  switch (command) {
    case "list":
      await cmdList();
      break;

    case "set": {
      const userId = parseInt(args[0], 10);
      const phone = args[1];
      if (isNaN(userId) || !phone) {
        console.error(colorize("\n✗ Usage: set <userId> <phone>\n", "admin"));
        process.exit(1);
      }
      await cmdSet(userId, phone);
      break;
    }

    case "set-by-email": {
      const email = args[0];
      const phone = args[1];
      if (!email || !phone) {
        console.error(colorize("\n✗ Usage: set-by-email <email> <phone>\n", "admin"));
        process.exit(1);
      }
      await cmdSetByEmail(email, phone);
      break;
    }

    case "clear": {
      const userId = parseInt(args[0], 10);
      if (isNaN(userId)) {
        console.error(colorize("\n✗ Usage: clear <userId>\n", "admin"));
        process.exit(1);
      }
      await cmdClear(userId);
      break;
    }

    case "bulk": {
      const filePath = args[0];
      if (!filePath) {
        console.error(colorize("\n✗ Usage: bulk <path/to/file.json>\n", "admin"));
        process.exit(1);
      }
      await cmdBulk(filePath);
      break;
    }

    default:
      printHelp();
      break;
  }
}

main().catch((err) => {
  console.error(colorize(`\n✗ Unexpected error: ${err.message}\n`, "admin"));
  process.exit(1);
});
