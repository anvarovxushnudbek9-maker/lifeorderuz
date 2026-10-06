import { supabase } from "@/integrations/supabase/client";

/** POST to the AI coach endpoint with the signed-in user's bearer token. */
export async function aiFetch(body: unknown): Promise<Response> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}
