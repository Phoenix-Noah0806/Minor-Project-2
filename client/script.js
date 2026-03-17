let currentUser = null;
let currentEditId = null;
let currentCommentConfessionId = null;
let confessionsById = {};
let selectedFeedFilter = "all";
let currentDraftId = null;
let drafts = [];
let savedPostIds = [];

function getDraftStorageKey() {
  return `cw_drafts_${currentUser?.id || "guest"}`;
}

function getSavedStorageKey() {
  return `cw_saved_${currentUser?.id || "guest"}`;
}

function loadPersonalDataFromStorage() {
  try {
    drafts = JSON.parse(localStorage.getItem(getDraftStorageKey()) || "[]");
    savedPostIds = JSON.parse(localStorage.getItem(getSavedStorageKey()) || "[]");
  } catch {
    drafts = [];
    savedPostIds = [];
  }
}

function persistDrafts() {
  localStorage.setItem(getDraftStorageKey(), JSON.stringify(drafts));
}

function persistSaved() {
  localStorage.setItem(getSavedStorageKey(), JSON.stringify(savedPostIds));
}

function updateHistoryCounts() {
  const draftCountEl = document.getElementById("draftCount");
  const savedCountEl = document.getElementById("savedCount");
  if (draftCountEl) draftCountEl.textContent = `(${drafts.length})`;
  if (savedCountEl) savedCountEl.textContent = `(${savedPostIds.length})`;
}

function normalizeVibe(vibe = "") {
  return String(vibe).trim().toLowerCase();
}

function getFilterFromButtonText(text = "") {
  const normalized = text.trim().toLowerCase();
  if (normalized.includes("all")) return "all";
  if (normalized.includes("crush")) return "crush";
  if (normalized.includes("study")) return "study";
  if (normalized.includes("funny")) return "funny";
  if (normalized.includes("secret")) return "secret";
  return "all";
}

function applyReactionState(card, reactions = {}, selectedType = null) {
  const reactionTypes = ["heart", "laugh", "sad"];

  reactionTypes.forEach((reactionType) => {
    const btn = card.querySelector(
      `.reaction-btn[data-reaction="${reactionType}"]`,
    );
    if (!btn) return;

    const countEl = btn.querySelector(".reaction-count");
    if (countEl) {
      countEl.textContent = reactions[reactionType] ?? 0;
    }

    btn.classList.toggle("active", reactionType === selectedType);
  });
}
async function checkUser() {
  const res = await fetch("http://localhost:3000/auth/user", {
    credentials: "include",
  });

  const user = await res.json();

  if (!user) {
    window.location.href = "index.html";
    return;
  }
  currentUser = user;
  loadPersonalDataFromStorage();
  updateHistoryCounts();

  const welcome = document.querySelector(".welcome-card h2");
  if (welcome) {
    welcome.innerText = "Welcome, Player " + (user.displayName || "Unknown");
  }
}

async function logOut() {
  await fetch("http://localhost:3000/auth/logout", {
    credentials: "include",
  });

  window.location.href = "/";
}

// checkUser();
async function loadConfessions() {
  const res = await fetch("http://localhost:3000/confessions");
  const data = await res.json();
  confessionsById = Object.fromEntries(data.map((c) => [c._id, c]));
  const filteredData =
    selectedFeedFilter === "all"
      ? data
      : data.filter((c) => normalizeVibe(c.vibe) === selectedFeedFilter);

  const container = document.getElementById("confessionContainer");
  container.innerHTML = "";

  filteredData.forEach((c) => {
    const isSaved = savedPostIds.includes(c._id);
    const card = document.createElement("div");
    card.className = "confession-card";
    card.setAttribute("data-confession-id", c._id);

    const tagsHTML =
      c.tags && c.tags.length
        ? `<div class="card-tags">
            ${c.tags.map(tag => `<span class="tag">#${tag}</span>`).join("")}
           </div>`
        : "";

    const vibeEmojis = { crush: '💘', study: '📖', funny: '😈', secret: '🤫' };
    const vibeLabel = vibeEmojis[normalizeVibe(c.vibe)] ? `${vibeEmojis[normalizeVibe(c.vibe)]} ${c.vibe}` : c.vibe;

    card.innerHTML = `
      <div class="card-header">
        <span class="confession-id">${c.anonId}</span>
        <span>${new Date(c.createdAt).toLocaleString()}</span>
      </div>

      <div class="confession-category">${vibeLabel}</div>

      <p class="confession-text">${c.text}</p>

      ${tagsHTML}

      <div class="card-footer">
        <button class="action-btn reaction-btn" data-reaction="heart" onclick="react('${c._id}','heart')">
          <span class="reaction-emoji">💗</span>
          <span class="reaction-count">${c.reactions?.heart || 0}</span>
        </button>

        <button class="action-btn reaction-btn" data-reaction="laugh" onclick="react('${c._id}','laugh')">
          <span class="reaction-emoji">😈</span>
          <span class="reaction-count">${c.reactions?.laugh || 0}</span>
        </button>

        <button class="action-btn reaction-btn" data-reaction="sad" onclick="react('${c._id}','sad')">
          <span class="reaction-emoji">💀</span>
          <span class="reaction-count">${c.reactions?.sad || 0}</span>
        </button>

        <button class="action-btn" onclick="openCommentModal('${c._id}')">
          🎭 Chat (${c.comments?.length || 0})
        </button>

        <button class="action-btn" onclick="toggleSavePost('${c._id}')">
          ${isSaved ? "★ Unsave" : "☆ Save"}
        </button>
      </div>
    `;

    const selectedType =
      c.reactedUsers?.find((r) => r.userID === currentUser?.id)?.type || null;
    applyReactionState(card, c.reactions, selectedType);

    container.appendChild(card);
  });

  if (!filteredData.length) {
    container.innerHTML = `<div class="confession-card"><p class="confession-text">🎭 No messages found in the arena for this filter. Be the first to drop one.</p></div>`;
  }

  if (currentCommentConfessionId) {
    renderCommentModal();
  }
}
// Modal functionality
document.querySelector(".write-btn").addEventListener("click", function () {
  currentDraftId = null;
  document.getElementById("writeModal").style.display = "flex";
});

function closeModal() {
  document.getElementById("writeModal").style.display = "none";
  currentDraftId = null;
  document.getElementById("confessionText").value = "";
  document.getElementById("confessionTags").value = "";
  document.getElementById("secretCode").value = "";
  document
    .querySelectorAll(".vibe-btn")
    .forEach((b) => b.classList.remove("active"));
}

async function postConfession() {
  const text = document.getElementById("confessionText").value.trim();
  const vibe = document.querySelector(".vibe-btn.active")?.dataset.vibe || "";
  const secretCode = document.getElementById("secretCode").value.trim();
  const tagsRaw = document.getElementById("confessionTags").value.trim();
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()) : [];
  if (!text || !vibe || !secretCode) {
    return alert("All fields are required");
  }
  await fetch("http://localhost:3000/confessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ text, vibe, secretCode, tags }),
  });
  if (currentDraftId) {
    drafts = drafts.filter((d) => d.id !== currentDraftId);
    persistDrafts();
    updateHistoryCounts();
  }
  closeModal();
  loadConfessions();
}

function saveDraft() {
  const text = document.getElementById("confessionText").value.trim();
  const vibe = document.querySelector(".vibe-btn.active")?.dataset.vibe || "";
  const secretCode = document.getElementById("secretCode").value.trim();
  const tagsRaw = document.getElementById("confessionTags").value.trim();
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()) : [];

  if (!text && !vibe && !secretCode && !tagsRaw) {
    alert("Nothing to save as draft.");
    return;
  }

  const now = new Date().toISOString();
  const draft = {
    id: currentDraftId || `draft_${Date.now()}`,
    text,
    vibe,
    secretCode,
    tags,
    updatedAt: now,
    createdAt: now,
  };

  const existingIndex = drafts.findIndex((d) => d.id === draft.id);
  if (existingIndex >= 0) {
    draft.createdAt = drafts[existingIndex].createdAt || now;
    drafts[existingIndex] = draft;
  } else {
    drafts.unshift(draft);
  }

  persistDrafts();
  updateHistoryCounts();
  closeModal();
  alert("Draft saved.");
}

async function loadMyPosts() {
  const res = await fetch("http://localhost:3000/confessions/my", {
    credentials: "include",
  });

  const data = await res.json();

  const container = document.getElementById("myPostsContainer");
  container.innerHTML = "";

  data.forEach((c) => {
    const div = document.createElement("div");
    div.className = "history-post-item";

    div.innerHTML = `
       <p class="post-preview">${c.text}</p>
  <div class="post-meta">
    <span>${new Date(c.createdAt).toLocaleString()}</span>
  </div>

  <div class="history-post-actions">
    <button class="history-action-btn" onclick="viewPost('${c._id}')">View</button>
    <button class="history-action-btn" onclick="openEditModal('${c._id}')">Edit</button>
    <button class="history-action-btn delete" onclick="openDeleteModal('${c._id}')">Delete</button>
  </div>
    `;

    container.appendChild(div);
  });
}

function showHistory() {
  document.querySelector('.nav-link[href="#feed"]').classList.remove("active");
  document.querySelector('.nav-link[href="#history"]').classList.add("active");

  document.getElementById("historyModal").style.display = "flex";

  loadMyPosts();
  loadDrafts();
  loadSavedPosts();
}
function openEditModal(confessionId) {
  // Only allow editing user's own confessions

  currentEditId = confessionId;
  const card = document.querySelector(`[data-confession-id="${confessionId}"]`);
  const text = card.querySelector(".confession-text").textContent;
  const category = card.querySelector(".confession-category").textContent;

  document.getElementById("editConfessionText").value = text;
  document.getElementById("editSecretCode").value = "";
  document.getElementById("editError").style.display = "none";

  // Set vibe based on category
  document.querySelectorAll(".edit-vibe-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (category === "crush" && btn.dataset.vibe === "crush")
      btn.classList.add("active");
    if (category === "study" && btn.dataset.vibe === "study")
      btn.classList.add("active");
    if (category === "funny" && btn.dataset.vibe === "funny")
      btn.classList.add("active");
    if (category === "secret" && btn.dataset.vibe === "secret")
      btn.classList.add("active");
  });

  document.getElementById("editModal").style.display = "flex";
}

function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
  currentEditId = null;
}

async function saveEdit() {
  const secretCode = document.getElementById("editSecretCode").value.trim();
  const newText = document.getElementById("editConfessionText").value.trim();
  const vibe = document.querySelector(".edit-vibe-btn.active")?.dataset.vibe;

  if (!secretCode || !newText) {
    document.getElementById("editError").textContent = "All fields required";
    document.getElementById("editError").style.display = "block";
    return;
  }

  const res = await fetch(
    `http://localhost:3000/confessions/${currentEditId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ text: newText, vibe, secretCode }),
    },
  );

  const data = await res.json();

  if (!res.ok) {
    document.getElementById("editError").textContent = data.message;
    document.getElementById("editError").style.display = "block";
    return;
  }

  closeEditModal();
  loadConfessions();
}

let currentDeleteId = null;

function openDeleteModal(id) {
  currentDeleteId = id;

  document.getElementById("deleteSecretCode").value = "";
  document.getElementById("deleteError").style.display = "none";
  document.getElementById("deleteModal").style.display = "flex";
}

function closeDeleteModal() {
  document.getElementById("deleteModal").style.display = "none";
  currentDeleteId = null;
}

async function confirmDelete() {
  const secretCode = document.getElementById("deleteSecretCode").value.trim();

  if (!secretCode) {
    document.getElementById("deleteError").textContent =
      "Please enter secret code.";
    document.getElementById("deleteError").style.display = "block";
    return;
  }

  const res = await fetch(
    `http://localhost:3000/confessions/${currentDeleteId}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ secretCode }),
    },
  );

  const data = await res.json();

  if (!res.ok) {
    document.getElementById("deleteError").textContent = data.message;
    document.getElementById("deleteError").style.display = "block";
    return;
  }

  closeDeleteModal();
  loadConfessions();
}

// Filter buttons
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    this.classList.add("active");
    selectedFeedFilter = getFilterFromButtonText(this.textContent);
    loadConfessions();
  });
});

// Vibe buttons
document.querySelectorAll(".vibe-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    const parent = this.closest(".modal-body");
    const buttons = parent.querySelectorAll(".vibe-btn");
    buttons.forEach((b) => b.classList.remove("active"));
    this.classList.add("active");
  });
});

// Reaction buttons
document.querySelectorAll(".like-btn, .love-btn, .laugh-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    this.classList.toggle("active");
    const countEl = this.querySelector(".btn-count");
    let count = parseInt(countEl.textContent.replace(/[^\d]/g, "")) || 0;

    if (this.classList.contains("active")) {
      count++;
    } else {
      count = Math.max(0, count - 1);
    }

    if (count >= 1000) {
      countEl.textContent = (count / 1000).toFixed(1) + "k";
    } else {
      countEl.textContent = count;
    }
  });
});

// Show/Hide feed and history
function showFeed() {
  document.querySelector('.nav-link[href="#feed"]').classList.add("active");
  document
    .querySelector('.nav-link[href="#history"]')
    .classList.remove("active");
  document.querySelector(".main-container").style.display = "grid";
  closeHistoryModal();
}
async function react(id, type) {
  const card = document.querySelector(`[data-confession-id="${id}"]`);
  if (!card) return;

  const res = await fetch(`http://localhost:3000/confessions/${id}/react`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ type }),
  });

  const data = await res.json();
  if (!res.ok) {
    const details = data?.error ? ` (${data.error})` : "";
    alert((data.message || "Could not update reaction") + details);
    return;
  }

  applyReactionState(card, data.reactions, data.userReaction || type);
}
function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderCommentModal() {
  const confession = confessionsById[currentCommentConfessionId];
  const subtitleEl = document.getElementById("commentModalSubtitle");
  const countEl = document.getElementById("commentCount");
  const listEl = document.getElementById("commentList");
  if (!subtitleEl || !countEl || !listEl) return;

  if (!confession) {
    subtitleEl.textContent = "Message eliminated";
    countEl.textContent = "0";
    listEl.innerHTML = `<p class="comment-empty">No comments yet. Start the conversation.</p>`;
    return;
  }

  subtitleEl.textContent = `🎭 ${confession.anonId} • ${confession.vibe || "arena"}`;
  const comments = confession.comments || [];
  countEl.textContent = String(comments.length);

  if (!comments.length) {
    listEl.innerHTML = `<p class="comment-empty">🎭 No arena chat yet. Break the silence.</p>`;
    return;
  }

  listEl.innerHTML = comments
    .map((comment) => {
      const mine = comment.userID === currentUser?.id ? "you" : "masked player";
      const when = new Date(comment.createdAt || Date.now()).toLocaleString();
      return `
        <div class="comment-item">
          <div class="comment-meta">${mine} • ${when}</div>
          <div class="comment-text">${escapeHtml(comment.text || "")}</div>
        </div>
      `;
    })
    .join("");
}

function openCommentModal(confessionId) {
  currentCommentConfessionId = confessionId;
  renderCommentModal();
  document.getElementById("commentModal").style.display = "flex";
}

function closeCommentModal() {
  document.getElementById("commentModal").style.display = "none";
  document.getElementById("commentModalInput").value = "";
}

async function submitComment() {
  if (!currentCommentConfessionId) return;

  const input = document.getElementById("commentModalInput");
  const text = input.value.trim();
  if (!text) return;

  const res = await fetch(
    `http://localhost:3000/confessions/${currentCommentConfessionId}/comment`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ text }),
    },
  );

  const data = await res.json();
  if (!res.ok) {
    alert(data.message || "Could not add comment");
    return;
  }

  input.value = "";
  await loadConfessions();
}
function closeHistoryModal() {
  document.getElementById("historyModal").style.display = "none";
}

function showHistoryTab(tabName, tabEl) {
  // Hide all tab contents
  document.querySelectorAll(".history-tab-content").forEach((content) => {
    content.classList.remove("active");
  });

  // Remove active from all tabs
  document.querySelectorAll(".history-tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Show selected tab
  const contentId =
    tabName === "posts"
      ? "historyPosts"
      : tabName === "drafts"
        ? "historyDrafts"
        : "historySaved";
  document.getElementById(contentId).classList.add("active");
  if (tabEl) tabEl.classList.add("active");

  if (tabName === "drafts") loadDrafts();
  if (tabName === "saved") loadSavedPosts();
}

function viewPost(confessionId) {
  closeHistoryModal();
  showFeed();
  // Scroll to confession card
  const card = document.querySelector(`[data-confession-id="${confessionId}"]`);
  if (card) {
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.style.border = "2px solid var(--primary-color)";
    setTimeout(() => {
      card.style.border = "";
    }, 2000);
  }
}

function loadDrafts() {
  const container = document.getElementById("draftsContainer");
  if (!container) return;
  container.innerHTML = "";

  if (!drafts.length) {
    container.innerHTML = `<div class="empty-state"><p>No drafts saved.</p></div>`;
    return;
  }

  drafts
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .forEach((draft) => {
      const preview = draft.text || "(No text yet)";
      const item = document.createElement("div");
      item.className = "history-post-item draft";
      item.innerHTML = `
        <p class="post-preview">${escapeHtml(preview)}</p>
        <div class="post-meta">
          <span>Saved as draft</span>
          <span>•</span>
          <span>${new Date(draft.updatedAt || draft.createdAt).toLocaleString()}</span>
        </div>
        <div class="history-post-actions">
          <button class="history-action-btn" onclick="continueDraft('${draft.id}')">Continue</button>
          <button class="history-action-btn delete" onclick="deleteDraft('${draft.id}')">Delete</button>
        </div>
      `;
      container.appendChild(item);
    });
}

function continueDraft(draftId) {
  const draft = drafts.find((d) => d.id === draftId);
  if (!draft) return;

  currentDraftId = draft.id;
  closeHistoryModal();
  document.getElementById("writeModal").style.display = "flex";
  document.getElementById("confessionText").value = draft.text || "";
  document.getElementById("confessionTags").value = (draft.tags || []).join(", ");
  document.getElementById("secretCode").value = draft.secretCode || "";

  document.querySelectorAll(".vibe-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.vibe === draft.vibe);
  });
}

function deleteDraft(draftId) {
  drafts = drafts.filter((d) => d.id !== draftId);
  persistDrafts();
  updateHistoryCounts();
  loadDrafts();
}

function loadSavedPosts() {
  const container = document.getElementById("savedContainer");
  if (!container) return;
  container.innerHTML = "";

  const savedPosts = savedPostIds
    .map((id) => confessionsById[id])
    .filter(Boolean);

  if (!savedPosts.length) {
    container.innerHTML = `<div class="empty-state"><p>No saved posts yet.</p></div>`;
    return;
  }

  savedPosts.forEach((post) => {
    const item = document.createElement("div");
    item.className = "history-post-item saved";
    item.innerHTML = `
      <p class="post-preview">${escapeHtml(post.text || "")}</p>
      <div class="post-meta">
        <span>Saved</span>
        <span>•</span>
        <span>${new Date(post.createdAt).toLocaleString()}</span>
        <span>•</span>
        <span class="post-id">${post.anonId}</span>
      </div>
      <div class="history-post-actions">
        <button class="history-action-btn" onclick="viewPost('${post._id}')">View</button>
        <button class="history-action-btn delete" onclick="unsavePost('${post._id}')">Unsave</button>
      </div>
    `;
    container.appendChild(item);
  });
}

function toggleSavePost(confessionId) {
  if (savedPostIds.includes(confessionId)) {
    savedPostIds = savedPostIds.filter((id) => id !== confessionId);
  } else {
    savedPostIds.unshift(confessionId);
  }
  persistSaved();
  updateHistoryCounts();
  loadConfessions();
}

function unsavePost(confessionId) {
  savedPostIds = savedPostIds.filter((id) => id !== confessionId);
  persistSaved();
  updateHistoryCounts();
  loadSavedPosts();
  loadConfessions();
}

// Close modal on overlay click
document.getElementById("writeModal").addEventListener("click", function (e) {
  if (e.target === this) {
    closeModal();
  }
});

document.getElementById("editModal").addEventListener("click", function (e) {
  if (e.target === this) {
    closeEditModal();
  }
});

document.getElementById("deleteModal").addEventListener("click", function (e) {
  if (e.target === this) {
    closeDeleteModal();
  }
});

document.getElementById("historyModal").addEventListener("click", function (e) {
  if (e.target === this) {
    closeHistoryModal();
    showFeed();
  }
});

document.getElementById("commentModal").addEventListener("click", function (e) {
  if (e.target === this) {
    closeCommentModal();
  }
});
(async () => {
  await checkUser();
  loadConfessions();
})();
