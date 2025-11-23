import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Credit Score router
  creditScore: router({
    getMine: protectedProcedure.query(async ({ ctx }) => {
      const { getCreditScoreByUserId } = await import("./db");
      return await getCreditScoreByUserId(ctx.user.id);
    }),
  }),

  // Loan router
  loan: router({
    getMyLoans: protectedProcedure.query(async ({ ctx }) => {
      const { getUserLoans } = await import("./db");
      return await getUserLoans(ctx.user.id);
    }),
    getLoan: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === 'object' && val !== null && 'loanId' in val && typeof (val as any).loanId === 'number') {
          return val as { loanId: number };
        }
        throw new Error('Invalid input');
      })
      .query(async ({ input }) => {
        const { getLoanById } = await import("./db");
        return await getLoanById(input.loanId);
      }),
  }),

  // LP Position router
  lp: router({
    getMyPosition: protectedProcedure.query(async ({ ctx }) => {
      const { getLpPosition } = await import("./db");
      return await getLpPosition(ctx.user.id);
    }),
  }),

  // Pool router
  pool: router({
    getInfo: publicProcedure.query(async () => {
      const { getCreditPool } = await import("./db");
      return await getCreditPool();
    }),
  }),

  // Transaction router
  transaction: router({
    getMyTransactions: protectedProcedure.query(async ({ ctx }) => {
      const { getUserTransactions } = await import("./db");
      return await getUserTransactions(ctx.user.id);
    }),
  }),

  // NFT Minting router
  nft: router({
    getMyMint: protectedProcedure.query(async ({ ctx }) => {
      const { getNFTMintByUserId } = await import("./db");
      return await getNFTMintByUserId(ctx.user.id);
    }),
    mint: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === 'object' && val !== null && 
            'nullifierHash' in val && typeof (val as any).nullifierHash === 'string' &&
            'creditScore' in val && typeof (val as any).creditScore === 'number' &&
            'tier' in val && typeof (val as any).tier === 'string' &&
            'tokenId' in val && typeof (val as any).tokenId === 'number') {
          return val as { nullifierHash: string; creditScore: number; tier: string; tokenId: number };
        }
        throw new Error('Invalid input: nullifierHash, creditScore, tier, and tokenId are required');
      })
      .mutation(async ({ ctx, input }) => {
        const { getNFTMintByUserId, getNFTMintByNullifierHash, createNFTMint } = await import("./db");
        
        // Check if user already minted
        const existingMint = await getNFTMintByUserId(ctx.user.id);
        if (existingMint) {
          throw new Error('NFT already minted for this user');
        }
        
        // Check if nullifier hash already used
        const existingNullifier = await getNFTMintByNullifierHash(input.nullifierHash);
        if (existingNullifier) {
          throw new Error('This World ID verification has already been used to mint an NFT');
        }
        
        // Create NFT mint record
        await createNFTMint({
          userId: ctx.user.id,
          tokenId: input.tokenId,
          nullifierHash: input.nullifierHash,
          creditScore: input.creditScore,
          tier: input.tier,
        });
        
        return { success: true, tokenId: input.tokenId };
      }),
  }),
});

export type AppRouter = typeof appRouter;
