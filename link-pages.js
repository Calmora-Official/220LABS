// link-pages.js
import { supabase } from './supabase-config.js';

// ... (Your existing escapeHtml function can go here) ...
function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;",
        '"': "&quot;", "'": "&#39;",
    }[c]));
}

document.getElementById("open-project").addEventListener("click", async () => {
  const code = document.getElementById("access-code").value.trim().toUpperCase();
  const result = document.getElementById("shared-result");

  if (!code) {
    result.innerHTML = "<p class='hint'>Please enter a code.</p>";
    return;
  }

  result.innerHTML = "<p class='hint'>Searching...</p>";

  // Query the database for a project with the matching secret code
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('secret_code', code)
    .limit(1);

  if (error) {
    result.innerHTML = `<p class='hint'>Error searching: ${error.message}</p>`;
    return;
  }

  if (projects.length === 0) {
    result.innerHTML = "<p class='hint'>❌ No project found with that code.</p>";
    return;
  }

  const found = projects[0];

  let body = `<div class="project-card">
    <h3>${escapeHtml(found.title)}</h3>
    <div class="meta">${found.type.toUpperCase()} · ${new Date(found.created_at).toLocaleString()}</div>`;

  if (found.type === "text") {
    // For text, we stored the snippet in 'preview'. We need to fetch the full text.
    // Note: In a real app, you might store the full text in a separate column.
    // For now, we'll just show the preview.
    body += `<p>${escapeHtml(found.preview)}</p>`;
  } else if (found.file_url) {
    if (found.type === "image") {
      body += `<img src="${found.file_url}" style="max-width:100%;border-radius:6px;margin-top:0.6rem;" />`;
    } else if (found.type === "pdf") {
      body += `<embed src="${found.file_url}" type="application/pdf" width="100%" height="500px" style="margin-top:0.6rem;border-radius:6px;" />`;
    } else {
      // For videos or other files, provide a download link
      body += `<p>📁 ${escapeHtml(found.preview)}</p>
               <a href="${found.file_url}" target="_blank" style="color:#a0a0ff;">Open / Download file</a>`;
    }
  }

  body += "</div>";
  result.innerHTML = body;
});
