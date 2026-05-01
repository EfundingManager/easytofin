import type { Request } from "express";
import { getDb } from "../db";
import { applicationLogs } from "../../drizzle/schema";
import type { InsertApplicationLog } from "../../drizzle/schema";

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export interface LogContext {
  req?: Request;
  userId?: number;
  phoneUserId?: number;
  requestId?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private async saveLog(logData: InsertApplicationLog): Promise<void> {
    try {
      const db = await getDb();
      if (!db) {
        console.error("[Logger] Database connection not available");
        return;
      }
      await db.insert(applicationLogs).values(logData);
    } catch (error) {
      // If logging fails, just log to console to avoid infinite loops
      console.error("[Logger] Failed to save log:", error);
    }
  }

  private extractRequestInfo(req?: Request) {
    if (!req) return {};

    return {
      ipAddress: req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown",
      userAgent: req.headers["user-agent"],
      url: `${req.method} ${req.originalUrl}`,
      method: req.method,
    };
  }

  async log(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): Promise<void> {
    const requestInfo = this.extractRequestInfo(context?.req);

    const logData: InsertApplicationLog = {
      level,
      message,
      context: context?.req ? "api" : undefined,
      userId: context?.userId,
      phoneUserId: context?.phoneUserId,
      requestId: context?.requestId,
      ipAddress: requestInfo.ipAddress as string | undefined,
      userAgent: requestInfo.userAgent as string | undefined,
      url: requestInfo.url as string | undefined,
      method: requestInfo.method as string | undefined,
      metadata: context?.metadata ? JSON.stringify(context.metadata) : undefined,
    };

    await this.saveLog(logData);

    // Also log to console for development
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    switch (level) {
      case "debug":
        console.debug(logMessage, context?.metadata);
        break;
      case "info":
        console.info(logMessage, context?.metadata);
        break;
      case "warn":
        console.warn(logMessage, context?.metadata);
        break;
      case "error":
        console.error(logMessage, context?.metadata);
        break;
      case "fatal":
        console.error("[FATAL]", logMessage, context?.metadata);
        break;
    }
  }

  async debug(message: string, context?: LogContext): Promise<void> {
    await this.log("debug", message, context);
  }

  async info(message: string, context?: LogContext): Promise<void> {
    await this.log("info", message, context);
  }

  async warn(message: string, context?: LogContext): Promise<void> {
    await this.log("warn", message, context);
  }

  async error(message: string, context?: LogContext): Promise<void> {
    await this.log("error", message, context);
  }

  async fatal(message: string, context?: LogContext): Promise<void> {
    await this.log("fatal", message, context);
  }

  async logError(
    error: Error,
    context: string,
    logContext?: LogContext
  ): Promise<void> {
    await this.error(`${context}: ${error.message}`, {
      ...logContext,
      metadata: {
        errorName: error.name,
        errorStack: error.stack,
      },
    });
  }
}

export const logger = new Logger();
