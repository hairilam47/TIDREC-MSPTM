import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import speakersRouter from "./speakers";
import sessionsRouter from "./sessions";
import sponsorsRouter from "./sponsors";
import registrationsRouter from "./registrations";
import abstractsRouter from "./abstracts";
import announcementsRouter from "./announcements";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(speakersRouter);
router.use(sessionsRouter);
router.use(sponsorsRouter);
router.use(registrationsRouter);
router.use(abstractsRouter);
router.use(announcementsRouter);
router.use(statsRouter);

export default router;
