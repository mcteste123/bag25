const db = require('../../database');

class SalesHistoryRepository {
  async findAll() {
    const rows = await db.query(`
      SELECT sh.id, sh.product_id, p.name AS product_name, sh.quantity_sold, sh.sale_date
      FROM sales_history sh
      JOIN products p ON p.id = sh.product_id
      ORDER BY sh.sale_date DESC
    `);

    return rows;
  }

  async create({ product_id, product_name, quantity_sold, sale_date }) {
    const [row] = await db.query(`
      INSERT INTO sales_history (product_id, product_name, quantity_sold, sale_date)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [product_id, product_name, quantity_sold, sale_date]);

    return row;
  }

  async update(id, { product_id, product_name, quantity_sold, sale_date }) {
    const [row] = await db.query(`
      UPDATE sales_history
      SET product_id = $1, product_name = $2, quantity_sold = $3, sale_date = $4
      WHERE id = $5
      RETURNING *
    `, [product_id, product_name, quantity_sold, sale_date, id]);

    return row;
  }

  async delete(id) {
    const deleteOp = await db.query(`DELETE FROM sales_history WHERE id = $1`, [id]);
    return deleteOp;
  }
}

module.exports = new SalesHistoryRepository();
