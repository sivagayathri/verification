import { redis } from "../clients/redisClient.js";
import { supabase } from "../clients/supabaseClient.js";
import os from "os";

export const STREAM = process.env.STREAM_NAME || "credential_stream";
export const GROUP = process.env.STREAM_GROUP || "verification_group";
const WORKER_ID = process.env.WORKER_ID || os.hostname();
export const CONSUMER = process.env.CONSUMER_NAME || WORKER_ID;

export function fieldsToObject(fields: string[]): Record<string, string> {
  const obj: Record<string, string> = {};
  for (let i = 0; i < fields.length; i += 2) {
    const key = fields[i];
    const value = fields[i + 1];
    if (key !== undefined && value !== undefined) obj[key] = value;
  }
  return obj;
}

export async function handleStreamEntry(id: string, fields: string[]) {
  try {
    const obj = fieldsToObject(fields);
    const credentialid = obj["credentialid"];
    if (!credentialid) {
      console.warn("Stream message missing credentialid:", id);
      await redis.xack(STREAM, GROUP, id);
      return;
    }

    const { data: existing, error: selErr } = await supabase
      .from("verification")
      .select("credentialid")
      .eq("credentialid", credentialid)
      .single();

    if (selErr && selErr.code !== "PGRST116") {
      console.error("Supabase select error:", selErr);
      return;
    }

    if (!existing) {
      const payload = {
        name: obj.name ?? null,
        email: obj.email ?? null,
        credentialid,
        issuedat: obj.issuedat ?? new Date().toISOString(),
        worker: obj.worker ?? CONSUMER,
      };

      const { error: insErr } = await supabase.from("verification").insert([payload]);
      if (insErr) {
        console.error("Supabase insert error:", insErr);
        return;
      }
      console.log(`Inserted verification for ${credentialid}`);
    } else {
      console.log(`Already exists: ${credentialid}`);
    }

    await redis.xack(STREAM, GROUP, id);
  } catch (err) {
    console.error("handleStreamEntry error:", err);
  }
}

export async function ensureGroup() {
  try {
    await redis.xgroup("CREATE", STREAM, GROUP, "$", "MKSTREAM");
    console.log("Created stream consumer group");
  } catch (err: any) {
    if (String(err).includes("BUSYGROUP") || String(err).includes("exists")) {
      console.log("Consumer group already exists");
    } else {
      console.error("Error creating consumer group:", err);
      throw err;
    }
  }
}
