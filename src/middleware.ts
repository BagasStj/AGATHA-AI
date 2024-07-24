import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware({
  // Konfigurasi opsional
  // publicRoutes: ["/"],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};