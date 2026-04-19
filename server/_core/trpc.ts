import { NOT_ADMIN_ERR_MSG, NOT_MANAGER_ERR_MSG, NOT_STAFF_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Role hierarchy:
 *   admin    — full access to all procedures
 *   manager  — access to manager and staff procedures
 *   staff    — access to staff procedures only
 *   user     — access to protected (authenticated) procedures only
 */

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

/** Any authenticated user */
export const protectedProcedure = t.procedure.use(requireUser);

/** Admin only — full access */
export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

/** Manager or Admin — can manage staff, view reports, approve workflows */
export const managerProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    const allowedRoles: string[] = ['admin', 'manager'];
    if (!ctx.user || !allowedRoles.includes(ctx.user.role)) {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_MANAGER_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

/** Staff, Manager, or Admin — read-only access to client data and basic operations */
export const staffProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    const allowedRoles: string[] = ['admin', 'manager', 'staff'];
    if (!ctx.user || !allowedRoles.includes(ctx.user.role)) {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_STAFF_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

/** Super Admin only — full system access and user management */
export const superAdminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'super_admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: "Only Super Admin can access this" });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
