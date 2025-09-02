const DailyHealthLog = require('../db/DailyHealthLog');

exports.getDailySummary = async (req, res) => {
    try {
        const { user_id, log_date } = req.query;
        const mealTimes = ['morning','lunch','dinner'];
        const logs = await DailyHealthLog.findAll({ where: { user_id, log_date }, raw: true });

        const summary = mealTimes.map(mt => {
            const log = logs.find(l => l.meal_time === mt);
            return {
                meal_time: mt,
                medication_count: log?.medication_count || 0,
                symptom_count: log?.symptom_count || 0
            };
        });

        res.json(summary);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
