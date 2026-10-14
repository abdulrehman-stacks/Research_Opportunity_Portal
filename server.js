require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

const pool = mysql.createPool({
  host: process.env.DB_HOST, port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER, password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME, waitForConnections: true, connectionLimit: 10,
  dateStrings: ['DATE']
});

const TEXT = { title: 200, description: 65535, research_area: 100, faculty_name: 100, department: 100, required_skills: 255 };
function validate(b, partial) {
  const errors = [], clean = {};
  if (!b || typeof b !== 'object' || Array.isArray(b)) return { errors: ['Body must be a JSON object'] };
  for (const [k, max] of Object.entries(TEXT)) {
    if (b[k] === undefined) { if (!partial) errors.push(`${k} is required`); continue; }
    if (typeof b[k] !== 'string' || !b[k].trim()) errors.push(`${k} must be a non-empty string`);
    else if (b[k].trim().length > max) errors.push(`${k} must be at most ${max} characters`);
    else clean[k] = b[k].trim();
  }
  if (b.available_positions === undefined) { if (!partial) errors.push('available_positions is required'); }
  else {
    const n = Number(b.available_positions);
    if (!['number', 'string'].includes(typeof b.available_positions) || !Number.isInteger(n) || n <= 0)
      errors.push('available_positions must be an integer greater than 0');
    else clean.available_positions = n;
  }
  if (b.application_deadline === undefined) { if (!partial) errors.push('application_deadline is required'); }
  else {
    const d = b.application_deadline;
    const ok = typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) &&
      !isNaN(new Date(d + 'T00:00:00Z')) && new Date(d + 'T00:00:00Z').toISOString().slice(0, 10) === d;
    if (!ok) errors.push('application_deadline must be a valid date (YYYY-MM-DD)'); else clean.application_deadline = d;
  }
  if (b.status !== undefined) {
    if (!['Open', 'Closed'].includes(b.status)) errors.push('status must be "Open" or "Closed"'); else clean.status = b.status;
  }
  if (partial && !errors.length && !Object.keys(clean).length) errors.push('No updatable fields provided');
  return { errors, clean };
}
const bad = (res, errors) => res.status(400).json({ error: 'Validation failed', errors });
app.param('id', (req, res, next, id) => {
  if (!/^[1-9]\d*$/.test(id)) return bad(res, ['id must be a positive integer']);
  next();
});
app.post('/api/opportunities', async (req, res, next) => {
  try {
    const { errors, clean } = validate(req.body, false);
    if (errors.length) return bad(res, errors);
    const [r] = await pool.execute(
      `INSERT INTO research_opportunities
       (title, description, research_area, faculty_name, department, required_skills, available_positions, application_deadline, status)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [clean.title, clean.description, clean.research_area, clean.faculty_name, clean.department,
       clean.required_skills, clean.available_positions, clean.application_deadline, clean.status || 'Open']);
    const [rows] = await pool.execute('SELECT * FROM research_opportunities WHERE id = ?', [r.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});
app.get('/api/opportunities', async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM research_opportunities ORDER BY id');
    res.status(200).json(rows);
  } catch (e) { next(e); }
});
app.get('/api/opportunities/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM research_opportunities WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Opportunity not found' });
    res.status(200).json(rows[0]);
  } catch (e) { next(e); }
});
app.put('/api/opportunities/:id', async (req, res, next) => {
  try {
    const { errors, clean } = validate(req.body, true);
    if (errors.length) return bad(res, errors);
    const [found] = await pool.execute('SELECT id FROM research_opportunities WHERE id = ?', [req.params.id]);
    if (!found.length) return res.status(404).json({ error: 'Opportunity not found' });
    const cols = Object.keys(clean);
    await pool.execute(
      `UPDATE research_opportunities SET ${cols.map(c => `${c} = ?`).join(', ')} WHERE id = ?`,
      [...cols.map(c => clean[c]), req.params.id]);
    const [rows] = await pool.execute('SELECT * FROM research_opportunities WHERE id = ?', [req.params.id]);
    res.status(200).json(rows[0]);
  } catch (e) { next(e); }
});
app.delete('/api/opportunities/:id', async (req, res, next) => {
  try {
    const [r] = await pool.execute('DELETE FROM research_opportunities WHERE id = ?', [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Opportunity not found' });
    res.status(200).json({ message: `Opportunity ${req.params.id} deleted successfully` });
  } catch (e) { next(e); }
});
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Malformed JSON body' });
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
