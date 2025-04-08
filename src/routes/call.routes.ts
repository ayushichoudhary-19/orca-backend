import { Router, RequestHandler } from "express";
import { CallController } from "../controllers/call.controller";

const router = Router();

// Convert static class methods to RequestHandler functions
const getAllCalls: RequestHandler = async (req, res, next) => {
  try {
    await CallController.getAllCalls(req, res);
  } catch (error) {
    next(error);
  }
};

const getAllCallSessions: RequestHandler = async (req, res, next) => {
  try {
    await CallController.getAllCallSessions(req, res);
  } catch (error) {
    next(error);
  }
};

const getCallById: RequestHandler = async (req, res, next) => {
  try {
    await CallController.getCallById(req, res);
  } catch (error) {
    next(error);
  }
};

const getCallSessionById: RequestHandler = async (req, res, next) => {
  try {
    await CallController.getCallSessionById(req, res);
  } catch (error) {
    next(error);
  }
};

// const makeCall: RequestHandler = async (req, res, next) => {
//   try {
//     await CallController.makeCall(req, res);
//   } catch (error) {
//     next(error);
//   }
// };

const startCallSession: RequestHandler = async (req, res, next) => {
  try {
    await CallController.startCallSession(req, res);
  } catch (error) {
    next(error);
  }
};

const proceedToNextCall: RequestHandler = async (req, res, next) => {
  try {
    await CallController.proceedToNextCall(req, res);
  } catch (error) {
    next(error);
  }
};

const handleStatusCallback: RequestHandler = async (req, res, next) => {
  try {
    await CallController.handleStatusCallback(req, res);
  } catch (error) {
    next(error);
  }
};

const handleCallConnection: RequestHandler = async (req, res, next) => {
  try {
    await CallController.handleCallConnection(req, res);
  } catch (error) {
    next(error);
  }
};

const submitFeedback: RequestHandler = async (req, res, next) => {
  try {
    await CallController.submitFeedback(req, res);
  } catch (error) {
    next(error);
  }
};

const updateCallNotes: RequestHandler = async (req, res, next) => {
  try {
    await CallController.updateCallNotes(req, res);
  } catch (error) {
    next(error);
  }
};

// const holdCall: RequestHandler = async (req, res, next) => {
//   try {
//     await CallController.holdCall(req, res);
//   } catch (error) {
//     next(error);
//   }
// };

const endCall: RequestHandler = async (req, res, next) => {
  try {
    await CallController.endCall(req, res);
  } catch (error) {
    next(error);
  }
};

const generateToken: RequestHandler = async (req, res, next) => {
  try {
    await CallController.generateToken(req, res);
  } catch (error) {
    next(error);
  }
};

const createCall: RequestHandler = async (req, res, next) => {
  try {
    await CallController.createCall(req, res);
  } catch (error) {
    next(error);
  }
}
// GET routes
router.get("/", getAllCalls);
router.get("/sessions", getAllCallSessions);
router.get("/:id", getCallById);
router.get("/sessions/:id", getCallSessionById);

// POST routes
// router.post('/', makeCall);
router.post("/sessions", startCallSession);
router.post("/sessions/next", proceedToNextCall);
router.post("/status-callback", handleStatusCallback);
router.post("/connect", handleCallConnection);
router.post("/feedback", submitFeedback);
router.post("/notes", updateCallNotes);
router.post('/call', createCall);
// router.post("/hold", holdCall);
router.post("/end", endCall);
router.post("/token", generateToken);
// router.post("/bridge", CallController.bridgeCall);

export default router;
