const AADPP_LOCAL_ORIGINS = new Set(["http://localhost:3000", "http://127.0.0.1:3000"]);

const selectRegionButton = document.querySelector<HTMLButtonElement>("#selectRegionButton");
const connectionStatus = document.querySelector<HTMLElement>("#connectionStatus");
const popupHint = document.querySelector<HTMLElement>("#popupHint");

void initializePopup();

async function initializePopup() {
  const activeTab = await getActiveTab();
  const isConnected = Boolean(activeTab?.url && isAadppUrl(activeTab.url));

  updateConnectionStatus(isConnected);

  if (!selectRegionButton) {
    return;
  }

  selectRegionButton.disabled = !activeTab?.id || !isConnected;
  selectRegionButton.addEventListener("click", () => {
    if (!activeTab?.id) {
      updateHint("No active browser tab was found.");
      return;
    }

    void startRegionSelection(activeTab.id);
  });
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

  return tabs[0] ?? null;
}

async function startRegionSelection(tabId: number) {
  if (!selectRegionButton) {
    return;
  }

  selectRegionButton.disabled = true;
  updateHint("Preparing selector overlay...");

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["contentScript.js"],
    });
    await chrome.tabs.sendMessage(tabId, { type: "AADPP_START_REGION_SELECTION" });
    window.close();
  } catch (error) {
    selectRegionButton.disabled = false;
    updateHint(getExtensionErrorMessage(error));
  }
}

function isAadppUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl);

    return AADPP_LOCAL_ORIGINS.has(url.origin);
  } catch {
    return false;
  }
}

function updateConnectionStatus(isConnected: boolean) {
  if (!connectionStatus) {
    return;
  }

  connectionStatus.classList.toggle("connected", isConnected);
  connectionStatus.lastChild?.replaceWith(isConnected ? "Connected to AADPP" : "Open AADPP tab");

  updateHint(
    isConnected
      ? "Click the button, then drag over the document preview."
      : "Navigate to localhost:3000 on a document or OCR review page.",
  );
}

function updateHint(message: string) {
  if (popupHint) {
    popupHint.textContent = message;
  }
}

function getExtensionErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Chrome could not inject the selector. Try reloading the AADPP tab.";
}
