/*
========================================
Think Kisan Blog Post JavaScript
========================================

This file handles:
- Image upload and preview
- Copy summary to clipboard
- High contrast theme toggle
- Print/Export to PDF
- Smooth scroll and navigation
- Toast notifications
- Load hardcoded gallery images

No external libraries required.
========================================
*/

// ============================================
// Utility Functions
// ============================================

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, info)
 */
function showToast(message, type = "info") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast ${type} show`;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/**
 * Generate unique ID for uploaded images
 */
function generateId() {
  return `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// Navigation Scroll Effect
// ============================================

const nav = document.getElementById("main-nav");
let lastScroll = 0;

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;

  if (currentScroll > 100) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }

  lastScroll = currentScroll;
});

// ============================================
// Copy Summary to Clipboard
// ============================================

const copySummaryBtn = document.getElementById("copy-summary-btn");
const summaryText = document.getElementById("summary-text");

if (copySummaryBtn && summaryText) {
  copySummaryBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(summaryText.textContent);
      showToast("Summary copied to clipboard!", "success");

      // Visual feedback
      const originalHTML = copySummaryBtn.innerHTML;
      copySummaryBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 4L6 11L3 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Copied!
      `;

      setTimeout(() => {
        copySummaryBtn.innerHTML = originalHTML;
      }, 2000);
    } catch (err) {
      showToast("Failed to copy summary", "error");
      console.error("Copy failed:", err);
    }
  });
}

// ============================================
// High Contrast Theme Toggle
// ============================================

const themeToggle = document.getElementById("theme-toggle");
let isHighContrast = false;

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    isHighContrast = !isHighContrast;
    document.body.classList.toggle("high-contrast", isHighContrast);

    const message = isHighContrast ? "High contrast mode enabled" : "High contrast mode disabled";
    showToast(message, "success");
  });
}

// ============================================
// Image Upload and Preview
// ============================================

const uploadArea = document.getElementById("upload-area");
const imageUpload = document.getElementById("image-upload");
const imagePreviewGrid = document.getElementById("image-preview-grid");

// Store uploaded images
let uploadedImages = [];

// Hardcoded images to load on init
const hardcodedImages = [
  { src: "a1.jpeg" },
  { src: "a2.jpeg"},
  { src: "a3.jpeg" },
  { src: "a4.jpeg" },
  { src: "a5.jpeg"},
  { src: "a6.jpeg" }
];

/**
 * Create gallery item element
 * @param {string} id - Unique image ID
 * @param {string} src - Image source URL
 * @param {string} caption - Image caption
 */
function createGalleryItem(id, src, caption = "") {
  const item = document.createElement("div");
  item.className = "gallery-item";
  item.dataset.id = id;

  item.innerHTML = `
    <img src="${src}" alt="${caption || "Project image"}" loading="lazy">
   
    <button class="delete-btn" aria-label="Remove image">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  `;

  // Add delete functionality


  // Add image zoom on click
  const img = item.querySelector("img");
  img.addEventListener("click", () => {
    openImageModal(src);
  });

  return item;
}

/**
 * Load hardcoded images
 */
function loadHardcodedImages() {
  if (!imagePreviewGrid) return;
  hardcodedImages.forEach((imgData) => {
    const id = generateId();
    uploadedImages.push({ id, src: imgData.src, caption: imgData.caption });
    const galleryItem = createGalleryItem(id, imgData.src, imgData.caption);
    imagePreviewGrid.appendChild(galleryItem);
  });
}

/**
 * Handle file upload
 * @param {FileList} files - Files to upload
 */
function handleFiles(files) {
  if (!imagePreviewGrid) return;

  Array.from(files).forEach((file) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      showToast(`${file.name} is not an image file`, "error");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showToast(`${file.name} is too large (max 5MB)`, "error");
      return;
    }

    const reader = new FileReader();
    const id = generateId();

    reader.onload = (e) => {
      const imageData = {
        id: id,
        src: e.target.result,
        caption: "",
        filename: file.name,
      };

      uploadedImages.push(imageData);

      const galleryItem = createGalleryItem(id, e.target.result);
      imagePreviewGrid.appendChild(galleryItem);

      showToast(`${file.name} uploaded successfully`, "success");
    };

    reader.onerror = () => {
      showToast(`Failed to upload ${file.name}`, "error");
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Remove image from gallery
 * @param {string} id - Image ID to remove
 */
function removeImage(id) {
  const item = imagePreviewGrid.querySelector(`[data-id="${id}"]`);
  if (item) {
    item.style.opacity = "0";
    item.style.transform = "scale(0.8)";

    setTimeout(() => {
      item.remove();
      uploadedImages = uploadedImages.filter((img) => img.id !== id);
      showToast("Image removed", "success");
    }, 200);
  }
}

/**
 * Open image in modal (simple zoom effect)
 * @param {string} src - Image source URL
 */
function openImageModal(src) {
  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3000;
    cursor: zoom-out;
    animation: fadeIn 0.2s ease;
  `;

  const img = document.createElement("img");
  img.src = src;
  img.style.cssText = `
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  `;

  modal.appendChild(img);
  document.body.appendChild(modal);

  modal.addEventListener("click", () => {
    modal.style.opacity = "0";
    setTimeout(() => modal.remove(), 200);
  });
}

// Event listeners for upload
if (imageUpload) {
  imageUpload.addEventListener("change", (e) => {
    handleFiles(e.target.files);
    e.target.value = ""; // Reset input
  });
}

if (uploadArea) {
  // Click to upload
  uploadArea.addEventListener("click", () => {
    if (imageUpload) imageUpload.click();
  });

  // Drag and drop
  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("drag-over");
  });

  uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("drag-over");
  });

  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("drag-over");
    handleFiles(e.dataTransfer.files);
  });
}

// ============================================
// Print / Export to PDF
// ============================================

const printBtn = document.getElementById("print-btn");

if (printBtn) {
  printBtn.addEventListener("click", () => {
    // Save current scroll position
    const scrollPos = window.pageYOffset;

    // Trigger browser print dialog
    window.print();

    // Restore scroll position after print dialog closes
    setTimeout(() => {
      window.scrollTo(0, scrollPos);
    }, 100);

    showToast("Opening print dialog...", "info");
  });
}

// ============================================
// Smooth Scroll for Navigation Links
// ============================================

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));

    if (target) {
      const navHeight = nav ? nav.offsetHeight : 0;
      const targetPosition = target.offsetTop - navHeight - 20;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }
  });
});

// ============================================
// Add CSS animation for modal fade-in
// ============================================

const style = document.createElement("style");
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

// ============================================
// Initialize
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  loadHardcodedImages();
  console.log("Think Kisan site initialized successfully");
});