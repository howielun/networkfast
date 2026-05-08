const form = document.getElementById('contact-form');
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

let eggTaps = 0;
let eggTimer;
document.getElementById('disclaimer').addEventListener('click', function () {
  eggTaps++;
  clearTimeout(eggTimer);
  if (eggTaps >= 5) {
    eggTaps = 0;
    showToast('Designed by Howie 🙂');
  } else {
    eggTimer = setTimeout(function () { eggTaps = 0; }, 2000);
  }
});

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  if (!name) {
    document.getElementById('name').focus();
    return;
  }

  const contacts = readContacts();
  contacts.push({
    id: crypto.randomUUID(),
    name,
    team: document.getElementById('team').value.trim(),
    title: document.getElementById('title').value.trim(),
    notes: document.getElementById('notes').value.trim(),
    createdAt: new Date().toISOString(),
  });
  writeContacts(contacts);
  form.reset();
  document.getElementById('name').focus();
  renderContacts();
  showToast('Saved!');
});

function switchTab(tab) {
  const isAdd = tab === 'add';
  tabAdd.classList.toggle('active', isAdd);
  tabSaved.classList.toggle('active', !isAdd);
  panelAdd.hidden = !isAdd;
  panelSaved.hidden = isAdd;
  if (isAdd) document.getElementById('name').focus();
}

function readContacts() {
  return JSON.parse(localStorage.getItem('contacts') || '[]');
}

function writeContacts(contacts) {
  localStorage.setItem('contacts', JSON.stringify(contacts));
}

function renderContacts() {
  const query = searchInput.value.trim().toLowerCase();
  const all = readContacts();
  all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const contacts = query
    ? all.filter(c => [c.name, c.team, c.title, c.notes].some(f => f && f.toLowerCase().includes(query)))
    : all;

  milestoneCount.textContent = 'Tech X 2026 — ' + all.length + (all.length === 1 ? ' connection' : ' connections');
  milestoneMsg.textContent = milestoneMessage(all.length);
  contactUl.innerHTML = '';

  contacts.forEach(function (c) {
    contactUl.appendChild(buildContactItem(c));
  });
}

function buildContactItem(c) {
  const li = document.createElement('li');

  const header = document.createElement('div');
  header.className = 'contact-header';

  const nameDiv = document.createElement('div');
  nameDiv.className = 'contact-name';
  nameDiv.textContent = c.name;
  header.appendChild(nameDiv);

  const meta = [c.title, c.team].filter(Boolean).join(' · ');
  if (meta) {
    const metaDiv = document.createElement('div');
    metaDiv.className = 'contact-meta';
    metaDiv.textContent = meta;
    header.appendChild(metaDiv);
  }

  header.addEventListener('click', function () {
    editingId = (editingId === c.id) ? null : c.id;
    renderContacts();
  });

  li.appendChild(header);

  if (editingId === c.id) {
    li.appendChild(buildEditor(c));
  }

  return li;
}

function buildEditor(c) {
  const editor = document.createElement('div');
  editor.className = 'contact-edit';

  const nameLabel = makeField('Name', 'input', c.name);
  const teamLabel = makeField('Team / Org', 'input', c.team);
  const titleLabel = makeField('Role', 'input', c.title);
  const notesLabel = makeField('Notes', 'textarea', c.notes);

  editor.appendChild(nameLabel);
  editor.appendChild(teamLabel);
  editor.appendChild(titleLabel);
  editor.appendChild(notesLabel);

  const actions = document.createElement('div');
  actions.className = 'contact-actions';

  const updateBtn = document.createElement('button');
  updateBtn.type = 'button';
  updateBtn.className = 'btn-update';
  updateBtn.textContent = 'Update';
  updateBtn.addEventListener('click', function () {
    const nameInput = nameLabel.querySelector('input');
    const newName = nameInput.value.trim();
    if (!newName) {
      nameInput.focus();
      return;
    }
    updateContact(c.id, {
      name: newName,
      team: teamLabel.querySelector('input').value.trim(),
      title: titleLabel.querySelector('input').value.trim(),
      notes: notesLabel.querySelector('textarea').value.trim(),
    });
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'btn-delete';
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', function () {
    if (confirm('Delete ' + c.name + '? This cannot be undone.')) {
      deleteContact(c.id);
    }
  });

  actions.appendChild(updateBtn);
  actions.appendChild(deleteBtn);
  editor.appendChild(actions);

  return editor;
}

function makeField(text, type, value) {
  const label = document.createElement('label');
  label.appendChild(document.createTextNode(text));
  const input = type === 'textarea'
    ? document.createElement('textarea')
    : Object.assign(document.createElement('input'), { type: 'text' });
  input.value = value || '';
  label.appendChild(input);
  return label;
}

function updateContact(id, fields) {
  const contacts = readContacts();
  const idx = contacts.findIndex(c => c.id === id);
  if (idx !== -1) {
    contacts[idx] = { ...contacts[idx], ...fields };
    writeContacts(contacts);
  }
  editingId = null;
  renderContacts();
  showToast('Updated!');
}

function deleteContact(id) {
  const contacts = readContacts().filter(c => c.id !== id);
  writeContacts(contacts);
  editingId = null;
  renderContacts();
  showToast('Deleted');
}

function milestoneMessage(n) {
  if (n === 0)             return 'No people yet. Go talk to someone 🙂';
  if (n >= 1  && n < 5)    return 'No people yet. Go talk to someone 🙂';
  if (n >= 5  && n < 10)   return 'Nice start. The first few conversations are always the hardest.';
  if (n >= 10 && n < 15)   return 'You’re warming up. Names are starting to stick.';
  if (n >= 15 && n < 20)   return 'Momentum found. This already feels worthwhile.';
  if (n >= 20 && n < 25)   return 'Good pace. You’re getting real signal now.';
  if (n >= 25 && n < 30)   return 'Halfway through the day, probably. Still curious.';
  if (n >= 30 && n < 35)   return 'You’re in the flow now. Conversations come naturally.';
  if (n >= 35 && n < 40)   return 'Solid stretch. Take a moment to breathe.';
  if (n >= 40 && n < 45)   return 'A lot of context gathered. Patterns emerging.';
  if (n >= 45 && n < 50)   return 'That’s a full day of conversations. Nicely done.';
  return "That’s a lot of conversations.\nYour social battery deserves a break 😌";
}

function showToast(msg) {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}
