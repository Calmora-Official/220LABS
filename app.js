// 220 LABS — client-side project storage

const STORAGE_KEY = "220labs_projects";

function getProjects() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveProjects(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function renderProjects() {
  const list = document.getElementById("projects-list");
  const projects = getProjects();

  if (projects.length === 0) {
    list.innerHTML = "<p class='hint'>No projects yet. Create one above.</p>";
    return;
  }

  list.innerHTML = projects
    .map(
      (p) => `
    <div class="project-card">
      <h3>${escapeHtml(p.title)}</h3>
      <div class="meta">
        ${p.type.toUpperCase()} · ${new Date(p.createdAt).toLocaleString()}
        ${p.secretCode ? " · 🔒 code set" : ""}
      </div>
      <div class="preview">${escapeHtml(p.preview || "")}</div>
    </div>
  `
    )
    .join("");
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;",
  }[c]));
}

// Toggle text vs. file input
document.getElementById("project-type").addEventListener("change", (e) => {
  const isText = e.target.value === "text";
  document.getElementById("text-input-area").style.display = isText ? "block" : "none";
  document.getElementById("file-input-area").style.display = isText ? "none" : "block";
});

// Save a project
document.getElementById("save-project").addEventListener("click", () => {
  const title = document.getElementById("project-title").value.trim();
  const type = document.getElementById("project-type").value;
  const secretCode = document.getElementById("secret-code").value.trim();

  if (!title) return alert("Please enter a project title.");

  let preview = "";
  let fileData = null;

  if (type === "text") {
    const text = document.getElementById("project-text").value;
    preview = text.slice(0, 120) + (text.length > 120 ? "..." : "");
  } else {
    const fileInput = document.getElementById("project-file");
    if (!fileInput.files.length) return alert("Please choose a file.");

    const file = fileInput.files[0];
    preview = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;

    // Read the file as a Data URL so it lives inside localStorage.
    // For large files this may exceed the ~5MB localStorage limit.
    const reader = new FileReader();
    reader.onload = () => {
      fileData = reader.result; // base64 data URL
      persistProject({ title, type, preview, fileData, secretCode });
    };
    reader.readAsDataURL(file);
    return;
  }

  persistProject({ title, type, preview, fileData, secretCode });
});

function persistProject({ title, type, preview, fileData, secretCode }) {
  const projects = getProjects();
  projects.unshift({
    id: crypto.randomUUID(),
    title,
    type,
    preview,
    fileData,
    secretCode,
    createdAt: Date.now(),
  });
  saveProjects(projects);
  renderProjects();

  // Reset form
  document.getElementById("project-title").value = "";
  document.getElementById("project-text").value = "";
  document.getElementById("project-file").value = "";
  document.getElementById("secret-code").value = "";
}

renderProjects();
