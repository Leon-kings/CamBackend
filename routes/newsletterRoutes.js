const express = require("express");
const router = express.Router();
const newsletterController = require("../controllers/newsletterController");

// Subscribe to newsletter (Public)
router.post("/", newsletterController.subscribe);

// Get all subscribers (Admin)
router.get("/", newsletterController.getAllSubscribers);

// Get single subscriber by ID (Admin)
router.get("/:id", newsletterController.getSubscriberById);

// Update subscriber (Admin)
router.put("/:id", newsletterController.updateSubscriber);

// Delete subscriber (Admin)
router.delete("/:id", newsletterController.deleteSubscriber);
// admin
router.get("/stats/summary", newsletterController.getSubscriptionStatistics);
router.get("/stats/trends", newsletterController.getSubscriptionTrends);
router.post("/stats/report", newsletterController.sendSubscriptionReport);

module.exports = router;
