// Program 1: DOM manipulation, event handling, Fetch API and asynchronous functions.
const API_BASE = ""; // Set to "http://localhost:5000/api" to connect to the Express API.
const STORAGE_KEY = "clinic-queue-demo-v1";
const form = document.querySelector("#patientForm");
const body = document.querySelector("#queueBody");
const message = document.querySelector("#formMessage");
let patients = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

function saveLocal() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function renderQueue() {
  const query = document.querySelector("#search").value.trim().toLowerCase();
  const priority = document.querySelector("#filter").value;
  const visible = patients.filter(p =>
    (priority === "All" || p.priority === priority) &&
    (`${p.name} ${p.reason}`.toLowerCase().includes(query))
  );
  document.querySelector("#count").textContent = `${patients.length} patient${patients.length === 1 ? "" : "s"}`;
  document.querySelector("#empty").hidden = visible.length !== 0;
  body.innerHTML = visible.map(p => `
    <tr>
      <td>#${escapeHtml(p.token)}</td>
      <td><strong>${escapeHtml(p.name)}</strong><br><small>Age ${escapeHtml(p.age)}</small></td>
      <td>${escapeHtml(p.reason)}</td>
      <td><span class="pill ${p.priority === "Urgent" ? "urgent" : ""}">${escapeHtml(p.priority)}</span></td>
      <td><button class="delete" data-id="${escapeHtml(p.id)}" type="button">Remove</button></td>
    </tr>`).join("");
}
async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {"Content-Type":"application/json", ...(localStorage.getItem("clinic-token") ? {Authorization:`Bearer ${localStorage.getItem("clinic-token")}`} : {}), ...(options.headers || {})}
  });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return response.status === 204 ? null : response.json();
}
form.addEventListener("submit", async event => {
  event.preventDefault();
  const patient = {
    name: document.querySelector("#name").value.trim(),
    age: Number(document.querySelector("#age").value),
    reason: document.querySelector("#reason").value.trim(),
    priority: document.querySelector("#priority").value
  };
  if (patient.name.length < 2 || !Number.isInteger(patient.age) || patient.age < 0 || patient.age > 120 || !patient.reason) {
    message.textContent = "Please enter a valid name, age (0–120), and reason.";
    return;
  }
  try {
    if (API_BASE) {
      // POST demonstrates sending JSON to the REST API.
      const created = await apiRequest("/patients", {method:"POST", body:JSON.stringify(patient)});
      patients.unshift(created);
    } else {
      patients.unshift({...patient, id:crypto.randomUUID(), token:patients.length + 1});
      saveLocal();
    }
    form.reset(); message.textContent = "Patient added successfully."; renderQueue();
  } catch (error) { message.textContent = error.message; }
});
body.addEventListener("click", async event => {
  const button = event.target.closest("button[data-id]");
  if (!button) return;
  const id = button.dataset.id;
  try {
    if (API_BASE) await apiRequest(`/patients/${id}`, {method:"DELETE"});
    patients = patients.filter(p => String(p.id || p._id) !== id);
    saveLocal(); renderQueue();
  } catch (error) { message.textContent = error.message; }
});
document.querySelector("#search").addEventListener("input", renderQueue);
document.querySelector("#filter").addEventListener("change", renderQueue);

// GET and async/await are demonstrated when the API mode is enabled.
async function loadPatients() {
  if (!API_BASE) return renderQueue();
  try { patients = await apiRequest("/patients"); renderQueue(); }
  catch (error) { message.textContent = `Could not load API data: ${error.message}`; }
}
loadPatients();
