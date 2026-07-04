import { Router } from "express";
import { gethealth } from "../controllers/jobcontroller.js";

const router = Router();

router.get("/", async (req, res) => {
  await gethealth(req, res);
});

export default router;
