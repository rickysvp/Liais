import "dotenv/config";

type EnvCheck = {
  key: string;
  required: boolean;
};

const runtimeChecks: EnvCheck[] = [
  { key: "DATABASE_URL", required: true },
  { key: "SUPABASE_URL", required: true },
  { key: "SUPABASE_SERVICE_ROLE_KEY", required: true },
  { key: "DEEPSEEK_API_KEY", required: true },
  { key: "STRIPE_SECRET_KEY", required: true },
  { key: "STRIPE_WEBHOOK_SECRET", required: true },
  { key: "STRIPE_PRICE_STARTER_MONTHLY", required: true },
  { key: "STRIPE_PRICE_PRO_MONTHLY", required: true },
  { key: "STRIPE_PRICE_CREDIT_PACK_SMALL", required: true },
  { key: "STRIPE_PRICE_CREDIT_PACK_MEDIUM", required: true },
  { key: "APP_URL", required: true },
  { key: "FRONTEND_URL", required: true },
];

function isPlaceholder(value: string): boolean {
  const trimmed = value.trim();
  return (
    trimmed.length === 0 ||
    trimmed.includes("YOUR_") ||
    trimmed.includes("MY_") ||
    trimmed.includes("REPLACE_WITH_") ||
    trimmed.includes("price_...") ||
    trimmed.includes("sk_test_...") ||
    trimmed.includes("whsec_...")
  );
}

export function validateRuntimeEnvOrThrow() {
  const missing: string[] = [];
  for (const check of runtimeChecks) {
    if (!check.required) continue;
    const value = process.env[check.key];
    if (!value || isPlaceholder(value)) {
      missing.push(check.key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. Fill .env using .env.example before starting the server.`
    );
  }
}
