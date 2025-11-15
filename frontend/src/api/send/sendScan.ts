import { API_URL } from "../../config";
import { getUserId } from "./user";

export async function assess(inputUrl: string, model: string) {
  const payload = {
    meta: {
      generated_at: new Date().toISOString(),
      user_id: getUserId(),
      user_name: "frontend",
      role: "CISO",
      input: inputUrl,
    },
    mode: "single",
    models: [{ llm_model: model }],
  };

  console.log("📤 Final payload:", payload);

  // ------------------------
  // SEND TO /input
  // ------------------------
  await fetch(`${API_URL}/input`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // ------------------------
  // SEND TO /assess
  // ------------------------
  const res = await fetch(`${API_URL}/assess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Backend error");

  return res.json();
}
