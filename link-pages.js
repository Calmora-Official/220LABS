const STORAGE_KEY = "220labs_projects";

document.getElementById("open-project").addEventListener("click", () => {
  const code = document.getElementById("access-code").value.trim().toUpperCase();
  const result = document.getElementById("shared-result");

  if (!code) {
    result.innerHTML = "<p class='hint'>Please enter a code.</p>";
    return;
  }

  const projects = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  const found = projects.find((p) => p.secretCode?.toUpperCase() === code);

  if (!found) {
    result.innerHTML = "<p class='hint'>❌ No project found with that code.</p>";
    return;
  }

  let body = `<div class="project-card">
    <h3>${escapeHtml(found.title)}</h3>
    <div class="meta">${found.type.toUpperCase()} · ${new Date(found.createdAt).toLocaleString()}</div>`;

  if (found.type === "text" && found.fileData) {
    // fileData is null for text; preview holds the snippet, but we stored
    // the full text only in preview — adjust app.js if you need full text.
    body += `<p>${escapeHtml(found.preview)}</p>`;
  } else if (found.fileData) {
    if (found.type === "image") {
      body += `<img src="${found.fileData}" style="max-width:100%;border-radius:6px;margin-top:0.6rem;" />`;
    } else if (found.type === "pdf") {
      body += `<embed src="${found.fileData}" type="application/pdf" width="100%" height="500px" style="margin-top:0.6rem;border-radius:6px;" />`;
    } else {
      body += `<p>📁 ${escapeHtml(found.preview)}</p>
               <a href="${found.fileData}" download="${escapeHtml(found.title)}" style="color:#a0a0ff;">Download file</a>`;
    }
  }

  body += "</div>";
  result.innerHTML = body;
});

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;",
  }[c]));
}
