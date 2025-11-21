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
});

export type AppRouter = typeof appRouter;
