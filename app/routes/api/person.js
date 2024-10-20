import { Router } from "express";
import asyncMiddleware from "../middleware/index.js";
import Person from "../../controllers/person.js";

const router = Router();
const controller = new Person();

router.post('/person', asyncMiddleware(controller.create));
router.post('/person/:id/chat', asyncMiddleware(controller.startChat));
router.delete('/person/:id/chat', asyncMiddleware(controller.deleteChat));

export default router;
