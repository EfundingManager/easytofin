import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { phoneAuthRouter } from "./routers/phone-auth";
import { gmailAuthRouter } from "./routers/gmail-auth";
import { adminRouter } from "./routers/admin";
import { workflowRouter } from "./routers/workflow";
import { profileRouter } from "./routers/profile";
import { emailVerificationRouter } from "./routers/email-verification";

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
  phoneAuth: phoneAuthRouter,
  gmailAuth: gmailAuthRouter,
  admin: adminRouter,
  workflow: workflowRouter,
  profile: profileRouter,
  emailVerification: emailVerificationRouter,

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
