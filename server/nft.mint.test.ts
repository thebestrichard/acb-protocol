import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
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

  return ctx;
}

describe("nft.mint", () => {
  it("should successfully mint NFT for verified user", async () => {
    const ctx = createAuthContext(999); // Use unique user ID to avoid conflicts
    const caller = appRouter.createCaller(ctx);

    const result = await caller.nft.mint({
      nullifierHash: `test-nullifier-${Date.now()}`,
      creditScore: 750,
      tier: "B",
      tokenId: Math.floor(Date.now() / 1000),
    });

    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("tokenId");
  });

  it("should prevent duplicate minting for same user", async () => {
    const ctx = createAuthContext(1000);
    const caller = appRouter.createCaller(ctx);

    const mintData = {
      nullifierHash: `test-nullifier-duplicate-${Date.now()}`,
      creditScore: 800,
      tier: "A",
      tokenId: Math.floor(Date.now() / 1000),
    };

    // First mint should succeed
    await caller.nft.mint(mintData);

    // Second mint should fail
    await expect(
      caller.nft.mint({
        ...mintData,
        nullifierHash: `different-nullifier-${Date.now()}`,
        tokenId: Math.floor(Date.now() / 1000) + 1,
      })
    ).rejects.toThrow("NFT already minted for this user");
  });

  it("should prevent reusing same nullifier hash", async () => {
    const sharedNullifier = `shared-nullifier-${Date.now()}`;
    
    const ctx1 = createAuthContext(1001);
    const caller1 = appRouter.createCaller(ctx1);

    // First user mints with nullifier
    await caller1.nft.mint({
      nullifierHash: sharedNullifier,
      creditScore: 700,
      tier: "C",
      tokenId: Math.floor(Date.now() / 1000),
    });

    // Second user tries to use same nullifier
    const ctx2 = createAuthContext(1002);
    const caller2 = appRouter.createCaller(ctx2);

    await expect(
      caller2.nft.mint({
        nullifierHash: sharedNullifier,
        creditScore: 750,
        tier: "B",
        tokenId: Math.floor(Date.now() / 1000) + 1,
      })
    ).rejects.toThrow("This World ID verification has already been used to mint an NFT");
  });

  it("should retrieve minted NFT for user", async () => {
    const ctx = createAuthContext(1003);
    const caller = appRouter.createCaller(ctx);

    const tokenId = Math.floor(Date.now() / 1000);
    await caller.nft.mint({
      nullifierHash: `test-nullifier-retrieve-${Date.now()}`,
      creditScore: 850,
      tier: "A",
      tokenId,
    });

    const mint = await caller.nft.getMyMint();

    expect(mint).toBeDefined();
    expect(mint?.tokenId).toBe(tokenId);
    expect(mint?.creditScore).toBe(850);
    expect(mint?.tier).toBe("A");
  });

  it("should return undefined for user without minted NFT", async () => {
    const ctx = createAuthContext(1004);
    const caller = appRouter.createCaller(ctx);

    const mint = await caller.nft.getMyMint();

    expect(mint).toBeUndefined();
  });
});
