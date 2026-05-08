const form = document.getElementById('contact-form');
const saveBtn = document.getElementById('save-btn');
const toast = document.getElementById('toast');
const contactUl = document.getElementById('contact-ul');
const milestoneCount = document.getElementById('milestone-count');
const milestoneMsg = document.getElementById('milestone-msg');
const searchInput = document.getElementById('search');
const tabAdd = document.getElementById('tab-add');
const tabSaved = document.getElementById('tab-saved');
const panelAdd = document.getElementById('panel-add');
const panelSaved = document.getElementById('panel-saved');

let editingId = null;
let toastTimer;

switchTab('add');
renderContacts();

tabAdd.addEventListener('click', () => switchTab('add'));
tabSaved.addEventListener('click', () => switchTab('saved'));
searchInput.addEventListener('input', renderContacts);

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  if (!name) {
    document.getElementById('name').focus();
    return;
  }

  const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');

  if (editingId) {
    const idx = contacts.findIndex(c => c.id === editingId);
    if (idx !== -1) {
      contacts[idx] = {
        ...contacts[idx],
        name,
        team: document.getElementById('team').value.trim(),
        title: document.getElementById('title').value.trim(),
        notes: document.getElementById('notes').value.trim(),
      };
    }
    localStorage.setItem('contacts', JSON.stringify(contacts));
    editingId = null;
    saveBtn.textContent = 'Save';
    form.reset();
    renderContacts();
    showToast('Updated!');
    switchTab('saved');
  } else {
    contacts.push({
      id: crypto.randomUUID(),
      name,
      team: document.getElementById('team').value.trim(),
      title: document.getElementById('title').value.trim(),
      notes: document.getElementById('notes').value.trim(),
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('contacts', JSON.stringify(contacts));
    form.reset();
    document.getElementById('name').focus();
    renderContacts();
    showToast('Saved!');
  }
});

function switchTab(tab) {
  const isAdd = tab === 'add';
  tabAdd.classList.toggle('active', isAdd);
  tabSaved.classList.toggle('active', !isAdd);
  panelAdd.hidden = !isAdd;
  panelSaved.hidden = isAdd;
  if (isAdd) document.getElementById('name').focus();
}

function renderContacts() {
  const query = searchInput.value.trim().toLowerCase();
  const all = JSON.parse(localStorage.getItem('contacts') || '[]');
  all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const contacts = query
    ? all.filter(c => [c.name, c.team, c.title, c.notes].some(f => f && f.toLowerCase().includes(query)))
    : all;

  milestoneCount.textContent = 'Tech X 2026 — ' + all.length + ' people met so far';
  milestoneMsg.textContent = milestoneMessage(all.length);
  contactUl.innerHTML = '';

  contacts.forEach(function (c) {
    const meta = [c.title, c.team].filter(Boolean).join(' · ');
    const li = document.createElement('li');
    li.innerHTML =
      '<div class="contact-name">' + escapeHtml(c.name) + '</div>' +
      (meta ? '<div class="contact-meta">' + escapeHtml(meta) + '</div>' : '');
    li.addEventListener('click', function () {
      document.getElementById('name').value = c.name;
      document.getElementById('team').value = c.team;
      document.getElementById('title').value = c.title;
      document.getElementById('notes').value = c.notes;
      editingId = c.id;
      saveBtn.textContent = 'Update';
      switchTab('add');
    });
    contactUl.appendChild(li);
  });
}

function milestoneMessage(n) {
  if (n === 0)  return 'No people yet. Go talk to someone 🙂';
  if (n >= 50)  return "That's a lot of conversations. Your social battery deserves a break.";
  if (n >= 40)  return 'This is a good day for hallway conversations.';
  if (n >= 30)  return "You're in the flow now. Conversations everywhere.";
  if (n >= 20)  return 'Solid momentum. Definitely worth coming here.';
  if (n >= 10)  return "You're warming up. This conference is starting to work.";
  if (n >= 5)   return "Nice start. You've officially broken the ice.";
  return '';
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showToast(msg) {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}
