import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("creditScore router", () => {
  it("should return undefined for user with no credit score", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.creditScore.getMine();

    expect(result).toBeUndefined();
  });
});

describe("loan router", () => {
  it("should return empty array for user with no loans", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.loan.getMyLoans();

    expect(result).toEqual([]);
  });
});

describe("lp router", () => {
  it("should return undefined for user with no LP position", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lp.getMyPosition();

    expect(result).toBeUndefined();
  });
});

describe("transaction router", () => {
  it("should return empty array for user with no transactions", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.transaction.getMyTransactions();

    expect(result).toEqual([]);
  });
});
