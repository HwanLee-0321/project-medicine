const HealthAlert = require('../db/Health_alerts');

// 건강 이상 징후 저장
exports.createAlert = async (req, res) => {
  console.log('📥 POST 요청 도착:', req.body);
  const { user_id, alert_type, detected_at } = req.body;

  try {
    const newAlert = await HealthAlert.create({ user_id, alert_type, detected_at });
    res.status(201).json({ message: 'Alert created', alertId: newAlert.id });
  } catch (err) {
    console.error('Insert error:', err);  // 201: Created
    res.status(500).json({ error: 'Database insert error' });  // 500: Internal Server Error
  }
};

// 전체 조회
exports.getAlerts = async (req, res) => {
  try {
    const alerts = await HealthAlert.findAll({ order: [['detected_at', 'DESC']] });  // 모든 HealthAlert 데이터를 detected_at 기준 내림차순 정렬
    res.json(alerts);
  } catch (err) {
    console.error('Select error:', err);
    res.status(500).json({ error: 'Database select error' });
  }
};

// 특정 사용자 이력 조회
exports.getUserAlerts = async (req, res) => {
  const userId = req.params.userId;  // URL 파라미터에서 userId 추출

  try {
    const alerts = await HealthAlert.findAll({
      where: { user_id: userId },
      order: [['detected_at', 'DESC']],
    });
    res.json(alerts);
  } catch (err) {
    console.error('User select error:', err);
    res.status(500).json({ error: 'Database select error' });
  }
};
