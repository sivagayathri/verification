import  { redis } from "../clients/redisClient.js";
import  { STREAM, GROUP, handleStreamEntry, CONSUMER } from "./helpers.js";


export async function processPendingAndNew() {
  const pending = (await redis.xpending(STREAM, GROUP, "-", "+", 100)) as [string, string, number, number][];
  for (const p of pending) {
    const id = p[0];
    try {
      const redisAny = redis as any;
      const claimed = (await redisAny.xclaim(STREAM, GROUP, CONSUMER, 60000, id, "JUSTID", false)) as
        | [string, string[]][]
        | undefined;
      if (claimed?.length) await handleStreamEntry(claimed[0][0], claimed[0][1]);
    } catch (err) {
      console.warn("Claim error:", err);
    }
  }

  while (true) {
    try {
      const redisAny = redis as any;
      const res = await redisAny.xreadgroup(
        "GROUP",
        GROUP,
        CONSUMER,
        "BLOCK",
        5000,
        "COUNT",
        10,
        "STREAMS",
        STREAM,
        ">"
      );
      if (!res) continue;

      for (const [, messages] of res) {
        for (const [id, fields] of messages) {
          await handleStreamEntry(id, fields);
        }
      }
    } catch (err) {
      console.error("xreadgroup error:", err);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}
