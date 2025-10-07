import { Router } from "express";
import { supabase } from "../clients/supabaseClient.js";

export const router = Router();

router.post("/verify", async (req, res) => {
  const { credentialid } = req.body;
  if (!credentialid) return res.status(400).json({ error: "Missing credentialid" });

  try {
    const { data: credential, error } = await supabase
      .from("verification")
      .select("*")
      .eq("credentialid", credentialid)
      .single();

    if (error && error.code !== "PGRST116") return res.status(500).json({ error: error.message });
    if (!credential) return res.json({ valid: false, message: "Invalid credential" });

    return res.json({ valid: true, worker: credential.worker, timestamp: credential.issuedat });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
