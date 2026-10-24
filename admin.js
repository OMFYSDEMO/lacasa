let token = sessionStorage.getItem('adminToken') || '';
let currentFilter = 'all';
let allEnquiries = [];

if (token) showDashboard();

document.getElementById('passwordInput')
  .addEventListener('keypress', function(e) {
    if (e.key === 'Enter') doLogin();
  });

async function doLogin() {
  const pw = document.getElementById('passwordInput').value;
  const err = document.getElementById('loginError');
  err.style.display = 'none';
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    const data = await res.json();
    if (data.success) {
      token = data.token;
      sessionStorage.setItem('adminToken', token);
      showDashboard();
    } else {
      err.style.display = 'block';
    }
  } catch (e) {
    err.style.display = 'block';
  }
}

function doLogout() {
  token = '';
  sessionStorage.removeItem('adminToken');
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'block';
  document.getElementById('passwordInput').value = '';
}

async function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  await refreshEnquiries();
}

async function refreshEnquiries() {
  try {
    const res = await fetch('/api/enquiries', {
      headers: { 'Authorization': 'Bearer ' + token },
    });
    if (res.status === 401) { doLogout(); return; }
    const data = await res.json();
    allEnquiries = data.enquiries || [];
    renderEnquiries();
  } catch (e) {
    console.error('Failed to load', e);
  }
}

function setFilter(f) {
  currentFilter = f;
  document.querySelectorAll('.filters button')
    .forEach(b => b.classList.remove('active'));
  document.querySelector(
    '.filters button[data-filter="' + f + '"]'
  ).classList.add('active');
  renderEnquiries();
}

function renderEnquiries() {
  const list = document.getElementById('enquiriesList');
  const filtered = currentFilter === 'all'
    ? allEnquiries
    : allEnquiries.filter(e => e.status === currentFilter);
  document.getElementById('enquiryCount').textContent =
    allEnquiries.length + ' total';
  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty">' +
      '<h2>No enquiries yet</h2>' +
      '<p>Enquiries from your website will appear here.</p></div>';
    return;
  }
  list.innerHTML = filtered.map(function(e) {
    var html = '<div class="enquiry-card ' + e.status + '">';
    html += '<div class="top"><div>';
    html += '<div class="name">' + esc(e.name) + '</div>';
    html += '<div class="date">' + fmt(e.created_at) + '</div>';
    html += '</div><span class="status-badge ' + e.status + '">';
    html += e.status + '</span></div><div class="details">';
    if (e.email) html += det('Email', esc(e.email));
    if (e.phone) html += det('Phone', esc(e.phone));
    if (e.check_in) html += det('Check In', esc(e.check_in));
    if (e.check_out) html += det('Check Out', esc(e.check_out));
    if (e.guests) html += det('Guests', esc(e.guests));
    if (e.room_type) html += det('Room', esc(e.room_type));
    html += '</div>';
    if (e.message) html += '<div class="message">' + esc(e.message) + '</div>';
    html += '<div class="actions">';
    if (e.email) html += '<a href="mailto:' + esc(e.email) + '">Email</a>';
    if (e.phone) html += '<a href="tel:' + esc(e.phone) + '">Call</a>';
    if (e.phone) {
      var p = e.phone.replace(/[^0-9]/g, '');
      html += '<a href="https://wa.me/' + p + '" target="_blank">WhatsApp</a>';
    }
    html += btn('updateStatus(' + e.id + ',"read")', 'Mark Read');
    html += btn('updateStatus(' + e.id + ',"replied")', 'Replied');
    html += btn('updateStatus(' + e.id + ',"archived")', 'Archive');
    html += '<button class="danger" onclick="deleteEnquiry(' + e.id + ')">Delete</button>';
    html += '</div></div>';
    return html;
  }).join('');
}

function det(label, val) {
  return '<div class="detail"><label>' + label + '</label>' +
    '<span>' + val + '</span></div>';
}

function btn(onclick, label) {
  return '<button onclick="' + onclick + '">' + label + '</button>';
}

async function updateStatus(id, status) {
  try {
    await fetch('/api/enquiries/' + id, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify({ status: status }),
    });
    await refreshEnquiries();
  } catch (e) { alert('Failed to update'); }
}

async function deleteEnquiry(id) {
  if (!confirm('Delete this enquiry?')) return;
  try {
    await fetch('/api/enquiries/' + id, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token },
    });
    await refreshEnquiries();
  } catch (e) { alert('Failed to delete'); }
}

function esc(str) {
  var d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

function fmt(s) {
  if (!s) return '';
  var d = new Date(s + 'Z');
  return d.toLocaleString('en-IN', {
    day: 'numeric', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}
