import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import speakersRouter from "./speakers";
import sessionsRouter from "./sessions";
import savedSessionsRouter from "./saved_sessions";
import sponsorsRouter from "./sponsors";
import registrationsRouter from "./registrations";
import abstractsRouter from "./abstracts";
import announcementsRouter from "./announcements";
import statsRouter from "./stats";
import storageRouter from "./storage";
import usersRouter from "./users";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(speakersRouter);
router.use(savedSessionsRouter);
router.use(sessionsRouter);
router.use(sponsorsRouter);
router.use(registrationsRouter);
router.use(abstractsRouter);
router.use(announcementsRouter);
router.use(statsRouter);
router.use(storageRouter);
router.use(usersRouter);
router.use(settingsRouter);

export default router;
