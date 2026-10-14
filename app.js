const API = '/api/opportunities';
const $ = id => document.getElementById(id);
const FIELDS = ['title', 'description', 'research_area', 'faculty_name', 'department', 'required_skills', 'available_positions', 'application_deadline', 'status'];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function show(text, type = 'success') {
  $('alerts').innerHTML = `<div class="alert alert-${type} alert-dismissible fade show">${esc(text)}<button class="btn-close" data-bs-dismiss="alert" onclick="this.parentNode.remove()"></button></div>`;
}
async function api(url, opts = {}) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
  let data = null; try { data = await res.json(); } catch (e) {}
  if (!res.ok) throw new Error(data && data.errors ? `${data.error}: ${data.errors.join('; ')}` : (data && data.error) || `Request failed (${res.status})`);
  return data;
}
async function load() {
  try {
    const rows = await api(API);
    $('list').innerHTML = rows.length ? rows.map(o => `<tr><td>${o.id}</td><td>${esc(o.title)}</td><td>${esc(o.faculty_name)}</td>
      <td><span class="badge ${o.status === 'Open' ? 'badge-open' : 'badge-closed'}">${o.status}</span></td>
      <td><button class="btn btn-sm btn-info" onclick="view(${o.id})">View</button>
      <button class="btn btn-sm btn-warning" onclick="edit(${o.id})">Edit</button>
      <button class="btn btn-sm btn-secondary" onclick="closeOpp(${o.id})" ${o.status === 'Closed' ? 'disabled' : ''}>Close</button>
      <button class="btn btn-sm btn-danger" onclick="del(${o.id})">Delete</button></td></tr>`).join('')
      : '<tr><td colspan="5" class="text-muted">No opportunities yet.</td></tr>';
  } catch (e) { show(e.message, 'danger'); }
}
async function view(id) {
  try {
    const o = await api(`${API}/${id}`);
    $('details').innerHTML = `<h5>${esc(o.title)}</h5><p>${esc(o.description)}</p><ul class="list-unstyled mb-0">
      <li><b>Area:</b> ${esc(o.research_area)}</li><li><b>Faculty:</b> ${esc(o.faculty_name)}</li><li><b>Department:</b> ${esc(o.department)}</li>
      <li><b>Skills:</b> ${esc(o.required_skills)}</li><li><b>Positions:</b> ${o.available_positions}</li>
      <li><b>Deadline:</b> ${esc(o.application_deadline)}</li><li><b>Status:</b> ${o.status}</li></ul>`;
  } catch (e) { show(e.message, 'danger'); }
}
async function edit(id) {
  try {
    const o = await api(`${API}/${id}`);
    FIELDS.forEach(f => $(f).value = o[f]); $('id').value = o.id;
    $('formTitle').textContent = `Edit Opportunity #${o.id}`; $('saveBtn').textContent = 'Update';
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  } catch (e) { show(e.message, 'danger'); }
}
function resetForm() { $('form').reset(); $('id').value = ''; $('formTitle').textContent = 'Create Opportunity'; $('saveBtn').textContent = 'Create'; FIELDS.forEach(f => $(f).classList.remove('is-invalid')); }
$('resetBtn').onclick = resetForm;

$('form').onsubmit = async ev => {
  ev.preventDefault();
  let ok = true;
  FIELDS.forEach(f => { const bad = !$(f).value.trim() || (f === 'available_positions' && Number($(f).value) < 1); $(f).classList.toggle('is-invalid', bad); if (bad) ok = false; });
  if (!ok) return show('Please fill all required fields (positions must be 1 or more).', 'warning');
  const body = {}; FIELDS.forEach(f => body[f] = $(f).value.trim());
  body.available_positions = Number(body.available_positions);
  const id = $('id').value;
  try {
    await api(id ? `${API}/${id}` : API, { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) });
    show(id ? 'Opportunity updated successfully.' : 'Opportunity created successfully.'); resetForm(); load();
  } catch (e) { show(e.message, 'danger'); }
};
async function closeOpp(id) {
  try { await api(`${API}/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'Closed' }) }); show('Opportunity closed.'); load(); }
  catch (e) { show(e.message, 'danger'); }
}
async function del(id) {
  if (!confirm(`Delete opportunity #${id}? This cannot be undone.`)) return;
  try { const r = await api(`${API}/${id}`, { method: 'DELETE' }); show(r.message); $('details').innerHTML = '<span class="text-muted">Select an opportunity.</span>'; load(); }
  catch (e) { show(e.message, 'danger'); }
}
load();
