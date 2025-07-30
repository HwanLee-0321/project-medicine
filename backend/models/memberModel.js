const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function getUserById(id) {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0]; // 없으면 undefined
}

async function createUser({ id, pw, name, phone }) {
  await pool.query('INSERT INTO users (id, pw, name, phone) VALUES (?, ?, ?, ?)', [id, pw, name, phone]);
}

async function removeMember(id){
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();  // 트랜잭션 시작

    await conn.execute('DELETE FROM medication_schedule WHERE user_id = ?', [id]);
    await conn.execute('DELETE FROM medications WHERE user_id = ?', [id]);

    const [result] = await conn.execute('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      console.warn(`삭제 실패: id ${id}가 존재하지 않음`);
      await conn.rollback();  // 롤백 처리
      return 0;
    }
    await conn.commit();

    return result.affectedRows;
  } catch (err) {
    console.error('삭제 중 오류 발생:', err);
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { getUserById, createUser, removeMember };
