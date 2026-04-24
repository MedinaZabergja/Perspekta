import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.ts";

const app = new Hono();

const supabase = () => createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
);

const defaultState = {
  hasCompletedOnboarding: false,
  currentScreen: "onboarding",
  currentEntry: null,
  reflectionModeUntil: null,
  reflectionModeDismissed: false,
  completedThoughts: [],
  fearJar: [],
  completedActivities: [],
};

const normalizeState = (state: any) => ({
  ...defaultState,
  ...state,
  currentEntry: state?.currentEntry ?? null,
  reflectionModeUntil: state?.reflectionModeUntil ?? null,
  reflectionModeDismissed: state?.reflectionModeDismissed ?? false,
  completedThoughts: state?.completedThoughts || [],
  fearJar: state?.fearJar || [],
  completedActivities: state?.completedActivities || [],
});

const getRequestIdentity = async (c: any) => {
  const headerUserId = c.req.header("X-User-Id") || "default";
  const authorization = c.req.header("Authorization");
  const token = authorization?.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    if (headerUserId.startsWith("auth:")) {
      return {
        error: c.json({ error: "Authentication required" }, 401),
      };
    }

    return {
      isAuthenticated: false,
      userId: headerUserId,
    };
  }

  const client = supabase();
  const { data, error } = await client.auth.getUser(token);

  if (error || !data.user) {
    if (!headerUserId.startsWith("auth:")) {
      return {
        isAuthenticated: false,
        userId: headerUserId,
      };
    }

    return {
      error: c.json({ error: "Unauthorized" }, 401),
    };
  }

  return {
    isAuthenticated: true,
    userId: `auth:${data.user.id}`,
  };
};

const getStateKey = (userId: string) => `perspekta_state_${userId}`;
const getThoughtsKey = (userId: string) => `perspekta_thoughts_${userId}`;

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-User-Id"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: false,
  }),
);

// Health check endpoint
app.get("/make-server-498ba2c0/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint
app.post("/make-server-498ba2c0/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    const client = supabase();
    const { data, error } = await client.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured
      email_confirm: true,
    });

    if (error) {
      console.log("Signup error:", error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log("Error during signup:", error);
    return c.json({ error: "Signup failed: " + error.message }, 500);
  }
});

// Sign in endpoint (actually just returns success - client handles auth)
app.post("/make-server-498ba2c0/auth/signin", async (c) => {
  try {
    return c.json({ success: true });
  } catch (error) {
    console.log("Error during signin:", error);
    return c.json({ error: "Signin failed: " + error.message }, 500);
  }
});

// Get app state
app.get("/make-server-498ba2c0/state", async (c) => {
  try {
    const identity = await getRequestIdentity(c);
    if ("error" in identity) {
      return identity.error;
    }

    const state = await kv.get(getStateKey(identity.userId));

    if (!state) {
      return c.json(defaultState);
    }

    return c.json(normalizeState(state));
  } catch (error) {
    console.log("Error getting app state:", error);
    return c.json({ error: "Failed to get app state: " + error.message }, 500);
  }
});

// Save app state
app.post("/make-server-498ba2c0/state", async (c) => {
  try {
    const identity = await getRequestIdentity(c);
    if ("error" in identity) {
      return identity.error;
    }

    const state = await c.req.json();

    await kv.set(getStateKey(identity.userId), normalizeState(state));

    return c.json({ success: true });
  } catch (error) {
    console.log("Error saving app state:", error);
    return c.json({ error: "Failed to save app state: " + error.message }, 500);
  }
});

// Get all thoughts
app.get("/make-server-498ba2c0/thoughts", async (c) => {
  try {
    const identity = await getRequestIdentity(c);
    if ("error" in identity) {
      return identity.error;
    }

    const thoughts = await kv.get(getThoughtsKey(identity.userId));

    return c.json(thoughts || []);
  } catch (error) {
    console.log("Error getting thoughts:", error);
    return c.json({ error: "Failed to get thoughts: " + error.message }, 500);
  }
});

// Add a thought
app.post("/make-server-498ba2c0/thoughts", async (c) => {
  try {
    const identity = await getRequestIdentity(c);
    if ("error" in identity) {
      return identity.error;
    }

    const thought = await c.req.json();

    const existingThoughts = await kv.get(getThoughtsKey(identity.userId)) || [];
    const updatedThoughts = [...existingThoughts, thought];

    await kv.set(getThoughtsKey(identity.userId), updatedThoughts);

    return c.json({ success: true, thought });
  } catch (error) {
    console.log("Error adding thought:", error);
    return c.json({ error: "Failed to add thought: " + error.message }, 500);
  }
});

Deno.serve(app.fetch);
