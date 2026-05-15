import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../services/user-services";

export const userRoutes = new Elysia({ prefix: "/api/users" })
  // Logic Register User
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const result = await registerUser(body);
        return result;
      } catch (error: any) {
        set.status = 400;
        return {
          status: "error",
          message: error.message,
        };
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 255 }),
        email: t.String({ maxLength: 255 }),
        password: t.String({ minLength: 6, maxLength: 255 }),
      }),
    }
  )
  // Logic Login User
  .post(
    "/login",
    async ({ body, set }) => {
      try {
        const token = await loginUser(body);
        return { data: token };
      } catch (error: any) {
        set.status = 401;
        return {
          status: "error",
          message: error.message,
        };
      }
    },
    {
      body: t.Object({
        email: t.String({ maxLength: 255 }),
        password: t.String({ minLength: 6, maxLength: 255 }),
      }),
    }
  )
  //Logic Get Current User & Logout User (Authentication)
  .group("", (app) =>
    app
      .derive(({ headers }) => {
        const auth = headers.authorization;
        return {
          token: auth?.startsWith("Bearer ") ? auth.substring(7) : null,
        };
      })
      // Logic Get Current User
      .post("/current", async ({ token, set }) => {
        if (!token) {
          set.status = 401;
          return { error: "Unauthorized" };
        }

        try {
          const user = await getCurrentUser(token);
          return { data: user };
        } catch (error: any) {
          if (error.message === "Unauthorized") {
            set.status = 401;
            return { error: "Unauthorized" };
          }

          set.status = 500;
          return { error: "Internal Server Error" };
        }
      })
      // Logic Logout User
      .delete("/logout", async ({ token, set }) => {
        if (!token) {
          set.status = 401;
          return { error: "Unauthorized" };
        }

        try {
          const message = await logoutUser(token);
          return { data: message };
        } catch (error: any) {
          if (error.message === "Unauthorized") {
            set.status = 401;
            return { error: "Unauthorized" };
          }

          set.status = 500;
          return { error: "Internal Server Error" };
        }
      })
  );
