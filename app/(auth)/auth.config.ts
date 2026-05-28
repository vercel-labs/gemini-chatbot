// AUTH CONFIG DISABLED
export const authConfig = {};
//       let isLoggedIn = !!auth?.user;
//       let isOnChat = nextUrl.pathname.startsWith("/");
//       let isOnRegister = nextUrl.pathname.startsWith("/register");
//       let isOnLogin = nextUrl.pathname.startsWith("/login");
//       if (isLoggedIn && (isOnLogin || isOnRegister)) {
//         return Response.redirect(new URL("/", nextUrl));
//       }
//       if (isOnRegister || isOnLogin) {
//         return true; // Always allow access to register and login pages
//       }
//       if (isOnChat) {
//         if (isLoggedIn) return true;
//         return false; // Redirect unauthenticated users to login page
//       }
//       if (isLoggedIn) {
//         return Response.redirect(new URL("/", nextUrl));
//       }
//       return true;
//     },
//   },
// } satisfies NextAuthConfig;
