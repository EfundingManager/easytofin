import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  // Use x-forwarded-host header for public domain (behind proxy/gateway)
  // Fall back to Host header, then req.hostname
  const forwardedHost = req.headers["x-forwarded-host"];
  const hostHeader = req.headers.host;
  const rawHost = forwardedHost 
    ? (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost)
    : (hostHeader 
        ? (Array.isArray(hostHeader) ? hostHeader[0] : hostHeader)
        : req.hostname);
  
  // Extract hostname without port
  const hostname = rawHost.split(":")[0];
  
  const shouldSetDomain =
    hostname &&
    !LOCAL_HOSTS.has(hostname) &&
    !isIpAddress(hostname) &&
    hostname !== "127.0.0.1" &&
    hostname !== "::1";

  // For production domains, use host-only cookie (no domain attribute)
  // This ensures the cookie is bound to the exact domain the user is accessing
  // Prevents domain mismatch issues when behind a gateway/proxy
  const domain = undefined;

  const isSecure = isSecureRequest(req);
  
  // For production domains, always use secure: true
  // For localhost/development, use the actual protocol
  const secure = !LOCAL_HOSTS.has(hostname) && !isIpAddress(hostname) ? true : isSecure;

  console.log("[Cookie Config]", {
    hostname,
    domain,
    secure,
    sameSite: "lax",
    protocol: req.protocol,
    xForwardedHost: forwardedHost,
    hostHeader: hostHeader,
  });

  return {
    domain,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure,
  };
}
