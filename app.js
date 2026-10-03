// app.js
import { supabase } from './supabase-config.js';

// ... (Your existing escapeHtml function can go here) ...
function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;",
  }[c]));
}

// Toggle text vs. file input (same as before)
document.getElementById("project-type").addEventListener("change", (e) => {
  const isText = e.target.value === "text";
  document.getElementById("text-input-area").style.display = isText ? "block" : "none";
  document.getElementById("file-input-area").style.display = isText ? "none" : "block";
});

// New function to save a project to Supabase
document.getElementById("save-project").addEventListener("click", async () => {
  const title = document.getElementById("project-title").value.trim();
  const type = document.getElementById("project-type").value;
  const secretCode = document.getElementById("secret-code").value.trim().toUpperCase(); // Uppercase for consistency
  const statusEl = document.getElementById("save-status"); // We'll add this to HTML

  if (!title) return alert("Please enter a project title.");
  if (type !== "text" && !document.getElementById("project-file").files.length) {
    return alert("Please choose a file.");
  }

  // Show a "Saving..." message
  if (statusEl) statusEl.textContent = "Saving...";

  let preview = "";
  let filePath = null;
  let fileUrl = null;

  try {
    if (type === "text") {
      const text = document.getElementById("project-text").value;
      preview = text.slice(0, 200); // Store a snippet as a preview
    } else {
      const file = document.getElementById("project-file").files[0];
      const fileExt = file.name.split('.').pop();
      // Create a unique file path to avoid collisions
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // 1. Upload the file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(uniqueFileName, file);

      if (uploadError) throw uploadError;

      filePath = uploadData.path;

      // 2. Get the public URL for the file
      const { data: urlData } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);
      
      fileUrl = urlData.publicUrl;
      preview = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    }

    // 3. Save the project metadata to the database
    const { error: dbError } = await supabase
      .from('projects')
      .insert({
        title: title,
        type: type,
        preview: preview,
        secret_code: secretCode || null,
        file_path: filePath,
        file_url: fileUrl
      });

    if (dbError) throw dbError;

    // Success! Reset the form.
    if (statusEl) statusEl.textContent = "Project saved successfully!";
    document.getElementById("project-title").value = "";
    document.getElementById("project-text").value = "";
    document.getElementById("project-file").value = "";
    document.getElementById("secret-code").value = "";
    document.getElementById("project-type").dispatchEvent(new Event('change')); // Reset visibility

    // Optionally, reload the list of projects (we'll create this function next)
    loadProjects();

  } catch (error) {
    console.error("Error saving project:", error);
    if (statusEl) statusEl.textContent = `Error: ${error.message}`;
    alert(`Failed to save project: ${error.message}`);
  }
});

// New function to load and display projects from Supabase
async function loadProjects() {
  const list = document.getElementById("projects-list");
  list.innerHTML = "<p class='hint'>Loading projects...</p>";

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20); // Show the 20 most recent projects

  if (error) {
    list.innerHTML = `<p class='hint'>Error loading projects: ${error.message}</p>`;
    return;
  }

  if (projects.length === 0) {
    list.innerHTML = "<p class='hint'>No projects yet. Create one above.</p>";
    return;
  }

  list.innerHTML = projects.map(p => `
    <div class="project-card">
      <h3>${escapeHtml(p.title)}</h3>
      <div class="meta">
        ${p.type.toUpperCase()} · ${new Date(p.created_at).toLocaleString()}
        ${p.secret_code ? " · 🔒 code set" : ""}
      </div>
      <div class="preview">${escapeHtml(p.preview || "")}</div>
    </div>
  `).join("");
}

// Load projects when the page first loads
loadProjects();
