import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  creditScores, 
  InsertCreditScore,
  loans,
  InsertLoan,
  lpPositions,
  InsertLpPosition,
  creditPools,
  CreditPool,
  transactions,
  InsertTransaction,
  nftMints,
  InsertNFTMint
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Credit Score queries
export async function getCreditScoreByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(creditScores).where(eq(creditScores.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertCreditScore(score: InsertCreditScore) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(creditScores).values(score).onDuplicateKeyUpdate({
    set: {
      score: score.score!,
      tier: score.tier!,
      totalLoans: score.totalLoans!,
      successfulRepayments: score.successfulRepayments!,
      defaults: score.defaults!,
      lastCalculated: new Date(),
    },
  });
}

// Loan queries
export async function createLoan(loan: InsertLoan) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.insert(loans).values(loan);
  return result[0].insertId;
}

export async function getLoanById(loanId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(loans).where(eq(loans.id, loanId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserLoans(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(loans).where(eq(loans.userId, userId));
}

export async function updateLoanStatus(loanId: number, status: 'active' | 'repaid' | 'defaulted', repaidAmount?: string) {
  const db = await getDb();
  if (!db) return;
  
  const updateData: any = { status, updatedAt: new Date() };
  if (status === 'repaid') {
    updateData.repaidAt = new Date();
    if (repaidAmount) updateData.repaidAmount = repaidAmount;
  }
  
  await db.update(loans).set(updateData).where(eq(loans.id, loanId));
}

// LP Position queries
export async function getLpPosition(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(lpPositions).where(eq(lpPositions.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertLpPosition(position: InsertLpPosition) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(lpPositions).values(position).onDuplicateKeyUpdate({
    set: {
      depositedAmount: position.depositedAmount,
      lpTokens: position.lpTokens,
      earnedInterest: position.earnedInterest!,
      updatedAt: new Date(),
    },
  });
}

// Credit Pool queries
export async function getCreditPool() {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(creditPools).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateCreditPool(poolData: Partial<CreditPool>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(creditPools).set({ ...poolData, updatedAt: new Date() }).where(eq(creditPools.id, 1));
}

// Transaction queries
export async function createTransaction(transaction: InsertTransaction) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(transactions).values(transaction);
}

export async function getUserTransactions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(transactions).where(eq(transactions.userId, userId));
}

// NFT Minting queries
export async function getNFTMintByUserId(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get NFT mint: database not available");
    return undefined;
  }
  const result = await db.select().from(nftMints).where(eq(nftMints.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createNFTMint(mint: InsertNFTMint) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create NFT mint: database not available");
    return undefined;
  }
  const result = await db.insert(nftMints).values(mint);
  return result;
}

export async function getNFTMintByNullifierHash(nullifierHash: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get NFT mint: database not available");
    return undefined;
  }
  const result = await db.select().from(nftMints).where(eq(nftMints.nullifierHash, nullifierHash)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
