// // types/express-session/index.d.ts

// import 'express-session';

// declare module 'express-session' {
//   interface SessionData {
//     user: {
//       id: string;
//       username: string;
//     };
//   }
// }

// types/session.d.ts (or types/express-session.d.ts)
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    user?: {
      id: string;
      username: string;
    };
  }
}