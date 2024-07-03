const express = require("express");
const router = express.Router();
const db = require("../database");

router.route('/setBudget').post(async (req, res) => {
    try {
        const user_id = req.session.user_id;
        const budgets = req.body;
        const {
            foodAndDrink,
            entertainment,
            generalMerchandise,
            personalCare,
            generalServices,
            transportation,
            travel,
            rentAndUtilities
        } = budgets;
        await db.setBudget(
            user_id,
            foodAndDrink,
            entertainment,
            generalMerchandise,
            personalCare,
            generalServices,
            transportation,
            travel,
            rentAndUtilities);
        res.status(200).send("Successfully updated budgets.");
    } catch (error) {
        console.error('Cannot set budget:', error);
        res.json({ error: 'Cannot set budget' });
    }
});

router.route('/getBudget').get(async (req, res) => {
    try {
        const user_id = req.session.user_id;
        const budget = await db.getBudget(user_id);
        res.status(200).send(budget[0][0]);
    } catch (error) {
        console.error('Cannot get budget:', error);
        res.json({ error: 'Cannot get budget' });
    }
});

module.exports = router;