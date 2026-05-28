(() => {
  type RegionSelectionMessage = {
    type: "AADPP_START_REGION_SELECTION";
  };

  type RegionPayload = {
    x: number;
    y: number;
    width: number;
    height: number;
    page: number;
  };

  type RegionSelectionState = {
    overlayElement: HTMLDivElement;
    selectionElement: HTMLDivElement;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    isDragging: boolean;
    cleanup: () => void;
  };

  type AadppWindow = Window &
    typeof globalThis & {
      __aadppRegionSelectorInstalled?: boolean;
    };

  const aadppWindow = window as AadppWindow;
  const MIN_SELECTION_SIZE_PX = 8;
  const OVERLAY_ID = "aadpp-ocr-region-selector-overlay";

  if (!aadppWindow.__aadppRegionSelectorInstalled) {
    aadppWindow.__aadppRegionSelectorInstalled = true;

    chrome.runtime.onMessage.addListener((message) => {
      if (isStartRegionSelectionMessage(message)) {
        startRegionSelection();
      }
    });

    window.addEventListener("message", (event: MessageEvent<unknown>) => {
      if (event.source === window && isWebAppStartSelectionMessage(event.data)) {
        startRegionSelection();
      }
    });
  }

  function startRegionSelection() {
    document.getElementById(OVERLAY_ID)?.remove();

    const overlayElement = document.createElement("div");
    const selectionElement = document.createElement("div");
    const selectionState: RegionSelectionState = {
      overlayElement,
      selectionElement,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      isDragging: false,
      cleanup: () => undefined,
    };

    overlayElement.id = OVERLAY_ID;
    overlayElement.setAttribute("role", "presentation");
    overlayElement.style.position = "fixed";
    overlayElement.style.inset = "0";
    overlayElement.style.zIndex = "2147483647";
    overlayElement.style.cursor = "crosshair";
    overlayElement.style.background = "rgba(2, 6, 23, 0.44)";
    overlayElement.style.backdropFilter = "blur(1px)";
    overlayElement.style.transition = "opacity 140ms ease";
    overlayElement.style.userSelect = "none";

    selectionElement.style.position = "absolute";
    selectionElement.style.left = "0";
    selectionElement.style.top = "0";
    selectionElement.style.width = "0";
    selectionElement.style.height = "0";
    selectionElement.style.border = "2px solid #4d7cff";
    selectionElement.style.borderRadius = "10px";
    selectionElement.style.background = "rgba(0, 82, 255, 0.16)";
    selectionElement.style.boxShadow =
      "0 0 0 9999px rgba(2, 6, 23, 0.36), 0 16px 48px rgba(0, 82, 255, 0.28)";
    selectionElement.style.pointerEvents = "none";
    selectionElement.style.transform = "translate3d(0, 0, 0)";

    overlayElement.append(selectionElement);
    document.documentElement.append(overlayElement);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        cancelSelection(selectionState);
      }
    };

    selectionState.cleanup = () => {
      document.removeEventListener("keydown", handleKeyDown);
    };

    overlayElement.addEventListener("pointerdown", (event) => handlePointerDown(event, selectionState));
    overlayElement.addEventListener("pointermove", (event) => handlePointerMove(event, selectionState));
    overlayElement.addEventListener("pointerup", (event) => handlePointerUp(event, selectionState));
    overlayElement.addEventListener("pointercancel", () => cancelSelection(selectionState));
    document.addEventListener("keydown", handleKeyDown);
  }

  function handlePointerDown(event: PointerEvent, selectionState: RegionSelectionState) {
    event.preventDefault();
    selectionState.overlayElement.setPointerCapture(event.pointerId);
    selectionState.startX = event.clientX;
    selectionState.startY = event.clientY;
    selectionState.currentX = event.clientX;
    selectionState.currentY = event.clientY;
    selectionState.isDragging = true;
    updateSelectionElement(selectionState);
  }

  function handlePointerMove(event: PointerEvent, selectionState: RegionSelectionState) {
    if (!selectionState.isDragging) {
      return;
    }

    selectionState.currentX = event.clientX;
    selectionState.currentY = event.clientY;
    updateSelectionElement(selectionState);
  }

  function handlePointerUp(event: PointerEvent, selectionState: RegionSelectionState) {
    if (!selectionState.isDragging) {
      return;
    }

    selectionState.currentX = event.clientX;
    selectionState.currentY = event.clientY;
    selectionState.isDragging = false;
    selectionState.overlayElement.releasePointerCapture(event.pointerId);

    const regionPayload = buildRegionPayload(selectionState);

    if (regionPayload.width >= MIN_SELECTION_SIZE_PX && regionPayload.height >= MIN_SELECTION_SIZE_PX) {
      window.postMessage(
        {
          source: "aadpp-chrome-extension",
          type: "AADPP_OCR_REGION_SELECTED",
          payload: regionPayload,
        },
        window.location.origin,
      );
    }

    selectionState.cleanup();
    removeOverlay(selectionState.overlayElement);
  }

  function cancelSelection(selectionState: RegionSelectionState) {
    selectionState.isDragging = false;
    selectionState.cleanup();
    removeOverlay(selectionState.overlayElement);
  }

  function updateSelectionElement(selectionState: RegionSelectionState) {
    const regionPayload = buildRegionPayload(selectionState);

    selectionState.selectionElement.style.left = `${regionPayload.x}px`;
    selectionState.selectionElement.style.top = `${regionPayload.y}px`;
    selectionState.selectionElement.style.width = `${regionPayload.width}px`;
    selectionState.selectionElement.style.height = `${regionPayload.height}px`;
  }

  function buildRegionPayload(selectionState: RegionSelectionState): RegionPayload {
    const left = Math.min(selectionState.startX, selectionState.currentX);
    const top = Math.min(selectionState.startY, selectionState.currentY);
    const right = Math.max(selectionState.startX, selectionState.currentX);
    const bottom = Math.max(selectionState.startY, selectionState.currentY);

    return {
      x: Math.round(left),
      y: Math.round(top),
      width: Math.round(right - left),
      height: Math.round(bottom - top),
      page: 1,
    };
  }

  function removeOverlay(overlayElement: HTMLDivElement) {
    overlayElement.style.opacity = "0";
    window.setTimeout(() => overlayElement.remove(), 140);
  }

  function isStartRegionSelectionMessage(message: unknown): message is RegionSelectionMessage {
    return Boolean(
      message &&
        typeof message === "object" &&
        (message as Partial<RegionSelectionMessage>).type === "AADPP_START_REGION_SELECTION",
    );
  }

  function isWebAppStartSelectionMessage(message: unknown): message is { source: string; type: string } {
    return Boolean(
      message &&
        typeof message === "object" &&
        (message as { source?: string }).source === "aadpp-web-app" &&
        (message as { type?: string }).type === "AADPP_START_REGION_SELECTION",
    );
  }
})();
