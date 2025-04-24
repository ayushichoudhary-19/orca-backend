import { Router } from "express";
import * as contextController from "../controllers/context.controller";

const router = Router();

router.get("/campaign/:campaignId", contextController.getContextsByCampaign);
router.post("/", contextController.createContext);
router.put("/:id", contextController.updateContext);
router.delete("/:id", contextController.deleteContext);

export default router;
