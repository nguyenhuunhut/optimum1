const form = document.getElementById("journey-form");

const nameInput = document.getElementById("name-input");
const foundInput = document.getElementById("found-input");
const didInput = document.getElementById("did-input");
const believeInput = document.getElementById("believe-input");

const nameOutput = document.getElementById("name-output");
const foundOutput = document.getElementById("found-output");
const didOutput = document.getElementById("did-output");
const believeOutput = document.getElementById("believe-output");

const saveImageButton = document.getElementById("save-image");
const timelineCapture = document.getElementById("timeline-capture");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll(".timeline-item").forEach((item) => observer.observe(item));

function syncInputsToTimeline() {
  nameOutput.textContent = nameInput.value.trim() || "Your Name";
  foundOutput.textContent = foundInput.value.trim() || "...";
  didOutput.textContent = didInput.value.trim() || "...";
  believeOutput.textContent = believeInput.value.trim() || "...";
}

[nameInput, foundInput, didInput, believeInput].forEach((input) => {
  input.addEventListener("input", syncInputsToTimeline);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  syncInputsToTimeline();
});

function canvasToBlob(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

function waitForImages(rootElement) {
  const images = Array.from(rootElement.querySelectorAll("img"));
  const pending = images
    .filter((img) => !img.complete || img.naturalWidth === 0)
    .map(
      (img) =>
        new Promise((resolve) => {
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        })
    );

  return Promise.all(pending);
}

function normalizePresetText(text) {
  return text.replace(/\s+/g, " ").trim();
}

saveImageButton.addEventListener("click", async () => {
  if (typeof html2canvas !== "function") {
    alert("Unable to load the capture library. Please run with Live Server or check your internet connection.");
    return;
  }

  saveImageButton.disabled = true;
  saveImageButton.textContent = "Saving...";

  try {
    await waitForImages(timelineCapture);
    const rect = timelineCapture.getBoundingClientRect();
    const canvas = await html2canvas(timelineCapture, {
      backgroundColor: "#070b14",
      scale: 2,
      useCORS: false,
      allowTaint: true,
      width: Math.ceil(rect.width),
      height: Math.ceil(rect.height),
      scrollX: 0,
      scrollY: -window.scrollY,
    });
    const blob = await canvasToBlob(canvas);

    if (!blob) {
      alert("Unable to export the image from canvas. Please try again.");
      return;
    }

    const fileUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "optimum-journey-timeline-x-card.png";
    link.href = fileUrl;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(fileUrl);
  } catch (error) {
    alert("Unable to save image. Please try again.");
  } finally {
    saveImageButton.disabled = false;
    saveImageButton.textContent = "Save Image";
  }
});

foundInput.value = normalizePresetText(foundOutput.textContent);
didInput.value = normalizePresetText(didOutput.textContent);
believeInput.value = normalizePresetText(believeOutput.textContent);
nameInput.value = normalizePresetText(nameOutput.textContent);
syncInputsToTimeline();
