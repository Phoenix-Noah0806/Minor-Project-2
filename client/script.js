let currentUser=null;

async function checkUser(){
  const res = await fetch("http://localhost:5000/auth/user", {
    credentials:"include"
  });

  const user = await res.json();

  if(!user){
    window.location.href="index.html";
    return;
  }
  currentUser=user;

    
  document.getElementById("authLoggedOut").style.display = "none";
  document.getElementById("authLoggedIn").style.display = "flex";

  
  document.querySelector(".welcome-card h2").innerText =
    "Welcome, " + user.displayName;
}

async function logOut() {
  await fetch("http://localhost:5000/auth/logout", {
    credentials: "include"
  });

  window.location.href = "index.html";
}

checkUser();
// Store confession secret codes (in real app, this would be on backend)
const confessionSecrets = {
  "8F3": "secret123",
  X92: "secret456",
  DB4: "secret789",
  A7X: "secret101",
  B22: "secret202",
};

// Track user's own confessions (in real app, this would come from backend)
const userConfessions = ["B22", "A7X"]; // User owns these confessions

// Check if confession belongs to current user
function isUserConfession(confessionId) {
  return userConfessions.includes(confessionId);
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

function postConfession() {
  const text = document.getElementById("confessionText").value.trim();
  const secretCode = document.getElementById("secretCode").value.trim();
  const selectedVibe = document.querySelector(".vibe-btn.active");

  if (!text) {
    alert("Please enter your confession.");
    return;
  }

  if (!secretCode) {
    alert("Please enter a secret code.");
    return;
  }

  if (!selectedVibe) {
    alert("Please select a vibe.");
    return;
  }

  // In real app, send to backend
  alert("Confession posted! Secret code saved. (This is a frontend demo)");
  closeModal();
}

function openEditModal(confessionId) {
  // Only allow editing user's own confessions
  if (!isUserConfession(confessionId)) {
    alert("You can only edit your own confessions.");
    return;
  }

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
    if (category.includes("Crush") && btn.dataset.vibe === "crush")
      btn.classList.add("active");
    if (category.includes("Study") && btn.dataset.vibe === "study")
      btn.classList.add("active");
    if (category.includes("Funny") && btn.dataset.vibe === "funny")
      btn.classList.add("active");
    if (category.includes("Secret") && btn.dataset.vibe === "secret")
      btn.classList.add("active");
  });

  document.getElementById("editModal").style.display = "flex";
}

function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
  currentEditId = null;
}

function saveEdit() {
  const secretCode = document.getElementById("editSecretCode").value.trim();
  const newText = document.getElementById("editConfessionText").value.trim();

  if (!secretCode) {
    document.getElementById("editError").textContent =
      "Please enter secret code.";
    document.getElementById("editError").style.display = "block";
    return;
  }

  // Verify secret code (in real app, check with backend)
  if (confessionSecrets[currentEditId] !== secretCode) {
    document.getElementById("editError").textContent = "Incorrect secret code.";
    document.getElementById("editError").style.display = "block";
    return;
  }

  if (!newText) {
    document.getElementById("editError").textContent =
      "Please enter confession text.";
    document.getElementById("editError").style.display = "block";
    return;
  }

  // Update confession (in real app, send to backend)
  const card = document.querySelector(
    `[data-confession-id="${currentEditId}"]`,
  );
  card.querySelector(".confession-text").textContent = newText;

  const selectedVibe = document.querySelector(".edit-vibe-btn.active");
  if (selectedVibe) {
    const vibeMap = {
      crush: "❤️ Crush",
      study: "📚 Study",
      funny: "🤣 Funny",
      secret: "😶 Secret",
    };
    card.querySelector(".confession-category").textContent =
      vibeMap[selectedVibe.dataset.vibe];
  }

  alert("Confession updated successfully!");
  closeEditModal();
}

function openDeleteModal(confessionId) {
  // Only allow deleting user's own confessions
  if (!isUserConfession(confessionId)) {
    alert("You can only delete your own confessions.");
    return;
  }

  currentDeleteId = confessionId;
  document.getElementById("deleteSecretCode").value = "";
  document.getElementById("deleteError").style.display = "none";
  document.getElementById("deleteModal").style.display = "flex";
}

function closeDeleteModal() {
  document.getElementById("deleteModal").style.display = "none";
  currentDeleteId = null;
}

function confirmDelete() {
  const secretCode = document.getElementById("deleteSecretCode").value.trim();

  if (!secretCode) {
    document.getElementById("deleteError").textContent =
      "Please enter secret code.";
    document.getElementById("deleteError").style.display = "block";
    return;
  }

  // Verify secret code (in real app, check with backend)
  if (confessionSecrets[currentDeleteId] !== secretCode) {
    document.getElementById("deleteError").textContent =
      "Incorrect secret code.";
    document.getElementById("deleteError").style.display = "block";
    return;
  }

  // Delete confession (in real app, send to backend)
  const card = document.querySelector(
    `[data-confession-id="${currentDeleteId}"]`,
  );
  card.remove();

  alert("Confession deleted successfully!");
  closeDeleteModal();
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

function showHistory() {
  document.querySelector('.nav-link[href="#feed"]').classList.remove("active");
  document.querySelector('.nav-link[href="#history"]').classList.add("active");
  document.getElementById("historyModal").style.display = "flex";
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

// Initialize: auth UI + edit/delete buttons only for user's confessions
document.addEventListener("DOMContentLoaded", function () {

  userConfessions.forEach((id) => {
    const actionsDiv = document.getElementById(`actions-${id}`);
    if (actionsDiv) {
      actionsDiv.style.display = "flex";
    }
  });
});

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


