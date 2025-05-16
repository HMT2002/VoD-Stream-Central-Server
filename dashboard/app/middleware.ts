// Without a defined matcher, this one line applies next-auth
// to the entire project
// import { isAuthenticated } from "@lib/auth";
export { default } from "next-auth/middleware";

// Applies next-auth only to matching routes - can be regex
// Ref: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    "/pages/dashboard",
    "/pages/changetopic",
    "/pages/process",
    "/pages/registerthesis",
    "/pages/homepage",
    "/pages/notificationpage",
    "/pages/deadlinepage",
  ],
};
