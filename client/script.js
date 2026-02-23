let currentUser = null;
let currentEditId = null;
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

  const welcome = document.querySelector(".welcome-card h2");
  if (welcome) {
    welcome.innerText = "Welcome, " + user.displayName;
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

  const container = document.getElementById("confessionContainer");
  container.innerHTML = "";

  data.forEach((c) => {
    const card = document.createElement("div");
    card.className = "confession-card";

    card.setAttribute("data-confession-id", c._id);

    const isOwner = currentUser && currentUser.id === c.userID; // ⭐ add this

    card.innerHTML = `
       <div class="card-header">
    <span class="confession-id">${c.anonId}</span>
    <span>${new Date(c.createdAt).toLocaleString()}</span>
  </div>

  <div class="confession-category">${c.vibe}</div>
  <p class="confession-text">${c.text}</p>

  ${
    c.tags && c.tags.length
      ? `<div class="card-tags">
          ${c.tags.map((tag) => `<span class="tag">#${tag}</span>`).join("")}
        </div>`
      : ""
  }

  
    `;

    container.appendChild(card);
  });
}
// Modal functionality
document.querySelector(".write-btn").addEventListener("click", function () {
  document.getElementById("writeModal").style.display = "flex";
});

function closeModal() {
  document.getElementById("writeModal").style.display = "none";
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
  closeModal();
  loadConfessions();
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

function continueDraft(draftId) {
  closeHistoryModal();
  document.getElementById("writeModal").style.display = "flex";
  // In real app, load draft content
}

function deleteDraft(draftId) {
  if (confirm("Delete this draft?")) {
    event.target.closest(".history-post-item").remove();
  }
}

function unsavePost(confessionId) {
  if (confirm("Unsave this post?")) {
    event.target.closest(".history-post-item").remove();
  }
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
(async () => {
  await checkUser();
  loadConfessions();
})();
