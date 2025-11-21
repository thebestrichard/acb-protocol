import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Credit Pool table - stores liquidity pool information
 */
export const creditPools = mysqlTable("credit_pools", {
  id: int("id").autoincrement().primaryKey(),
  totalLiquidity: varchar("total_liquidity", { length: 78 }).notNull().default("0"), // Wei amount as string
  totalBorrowed: varchar("total_borrowed", { length: 78 }).notNull().default("0"),
  baseInterestRate: int("base_interest_rate").notNull().default(500), // Basis points (500 = 5%)
  utilizationCoefficient: int("utilization_coefficient").notNull().default(1000), // k coefficient
  creditCoefficient: int("credit_coefficient").notNull().default(500), // c coefficient
  riskReserve: varchar("risk_reserve", { length: 78 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type CreditPool = typeof creditPools.$inferSelect;
export type InsertCreditPool = typeof creditPools.$inferInsert;

/**
 * Liquidity Provider positions
 */
export const lpPositions = mysqlTable("lp_positions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  poolId: int("pool_id").notNull().default(1),
  depositedAmount: varchar("deposited_amount", { length: 78 }).notNull(),
  lpTokens: varchar("lp_tokens", { length: 78 }).notNull(),
  earnedInterest: varchar("earned_interest", { length: 78 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type LpPosition = typeof lpPositions.$inferSelect;
export type InsertLpPosition = typeof lpPositions.$inferInsert;

/**
 * Credit Scores - tracks user creditworthiness
 */
export const creditScores = mysqlTable("credit_scores", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(),
  score: int("score").notNull().default(500), // 0-1000 range (500 = 0.5)
  tier: mysqlEnum("tier", ["A", "B", "C", "D"]).default("C").notNull(),
  totalLoans: int("total_loans").notNull().default(0),
  successfulRepayments: int("successful_repayments").notNull().default(0),
  defaults: int("defaults").notNull().default(0),
  lastCalculated: timestamp("last_calculated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type CreditScore = typeof creditScores.$inferSelect;
export type InsertCreditScore = typeof creditScores.$inferInsert;

/**
 * Loans table - tracks all loan records
 */
export const loans = mysqlTable("loans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  poolId: int("pool_id").notNull().default(1),
  amount: varchar("amount", { length: 78 }).notNull(),
  interestRate: int("interest_rate").notNull(), // Basis points
  duration: int("duration").notNull(), // Days
  status: mysqlEnum("status", ["active", "repaid", "defaulted"]).default("active").notNull(),
  borrowedAt: timestamp("borrowed_at").defaultNow().notNull(),
  dueDate: timestamp("due_date").notNull(),
  repaidAt: timestamp("repaid_at"),
  repaidAmount: varchar("repaid_amount", { length: 78 }).default("0"),
  creditScoreAtBorrow: int("credit_score_at_borrow").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Loan = typeof loans.$inferSelect;
export type InsertLoan = typeof loans.$inferInsert;

/**
 * Transaction history for audit trail
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  type: mysqlEnum("type", ["deposit", "withdraw", "borrow", "repay", "liquidation"]).notNull(),
  amount: varchar("amount", { length: 78 }).notNull(),
  relatedLoanId: int("related_loan_id"),
  relatedPoolId: int("related_pool_id").default(1),
  txHash: varchar("tx_hash", { length: 66 }), // Ethereum transaction hash
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;