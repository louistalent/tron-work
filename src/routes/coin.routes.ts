import express, { Router, Request, Response } from 'express';
import * as controllers from "../controllers/coin.controllers";

const router: Router = express.Router();

// router.get('/', controllers.getNewTRCAddress)
// router.post('/getTRXBalance', controllers.getTRXBalance)
// router.post('/getTRCBalance', controllers.getTRCBalance)
// router.post('/sendTRX', controllers.sendTRX)
// router.post('/sendTRC20', controllers.sendTRC20)
router.post('/sendToken', controllers.sendToken)
router.post('/sendNativeToken', controllers.sendNativeToken)
router.post('/test', controllers.test)

router.post('/estimateTransferFee', controllers.estimateTransferFee)
// router.post('/test', controllers.test)s


export default router;