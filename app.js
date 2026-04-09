const API = "";

let editingPatientId = null;
let editingProcedureId = null;

document.addEventListener("DOMContentLoaded", loadPatients);
document.getElementById("searchText").addEventListener("input", loadPatients);
document.getElementById("genderFilter").addEventListener("change", loadPatients);

/* ========== PATIENTS ========== */

async function loadPatients() {
  const search = document.getElementById("searchText").value;
  const gender = document.getElementById("genderFilter").value;

  const res = await fetch(`${API}/patients?search=${search}&gender=${gender}`);
  const patients = await res.json();

  populatePatientDropdown(patients);
  renderPatients(patients);
}

async function savePatient() {
  const name = patientName.value;
  const dob = patientDob.value;
  const gender = patientGender.value;

  if (!name) return;

  if (editingPatientId) {
    await fetch(`${API}/patients/${editingPatientId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, dob, gender })
    });
    editingPatientId = null;
  } else {
    await fetch(`${API}/patients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, dob, gender })
    });
  }

  patientName.value = patientDob.value = patientGender.value = "";
  document.getElementById("patientFormTitle").innerText = "Add Patient";
  loadPatients();
}

function editPatient(p) {
  editingPatientId = p.id;
  patientName.value = p.name;
  patientDob.value = p.dob || "";
  patientGender.value = p.gender || "";
  document.getElementById("patientFormTitle").innerText = "Edit Patient";
}

async function deletePatient(id) {
  if (!confirm("Delete patient and all procedures?")) return;
  await fetch(`${API}/patients/${id}`, { method: "DELETE" });
  loadPatients();
}

/* ========== PROCEDURES ========== */

async function saveProcedure() {
  const patientId = procedurePatient.value;
  const procedure = procedureDesc.value;
  const date = procedureDate.value;

  if (!patientId || !procedure) return;

  if (editingProcedureId) {
    await fetch(`${API}/procedures/${editingProcedureId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ procedure, date })
    });
    editingProcedureId = null;
    document.getElementById("procedureFormTitle").innerText = "Add Procedure";
  } else {
    await fetch(`${API}/procedures`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId, procedure, date })
    });
  }

  procedureDesc.value = procedureDate.value = "";
  loadPatients();
}

async function editProcedure(pr) {
  editingProcedureId = pr.id;
  procedureDesc.value = pr.procedure;
  procedureDate.value = pr.procedure_date || "";
  document.getElementById("procedureFormTitle").innerText = "Edit Procedure";
}

async function deleteProcedure(id) {
  await fetch(`${API}/procedures/${id}`, { method: "DELETE" });
  loadPatients();
}

/* ========== UI ========== */

function populatePatientDropdown(patients) {
  procedurePatient.innerHTML = "<option value=''>Select Patient</option>";
  patients.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.name;
    procedurePatient.appendChild(opt);
  });
}

async function renderPatients(patients) {
  records.innerHTML = "";

  for (const p of patients) {
    const div = document.createElement("div");
    div.className = "patient";
    div.innerHTML = `
      <strong>${p.name}</strong> (DOB: ${p.dob || "-"}, ${p.gender || "-"})
      <button class="small" onclick='editPatient(${JSON.stringify(p)})'>Edit</button>
      <button class="small danger" onclick='deletePatient(${p.id})'>Delete</button>
      <div id="proc-${p.id}"></div>
    `;
    records.appendChild(div);

    const res = await fetch(`${API}/procedures/${p.id}`);
    const procs = await res.json();

    procs.forEach(pr => {
      const pd = document.createElement("div");
      pd.className = "procedure";
      pd.innerHTML = `
        ${pr.procedure} (${pr.procedure_date || "-"})
        <button class="small" onclick='editProcedure(${JSON.stringify(pr)})'>Edit</button>
        <button class="small danger" onclick='deleteProcedure(${pr.id})'>Delete</button>
      `;
      div.querySelector(`#proc-${p.id}`).appendChild(pd);
    });
  }
}

function clearFilters() {
  searchText.value = "";
  genderFilter.value = "";
  loadPatients();
}