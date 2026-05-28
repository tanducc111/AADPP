export type ExtensionRegionSelectionPayload = {
  x: number;
  y: number;
  width: number;
  height: number;
  page?: number;
};

export type OcrRegionRequestPayload = {
  x: number;
  y: number;
  width: number;
  height: number;
  displayWidth: number;
  displayHeight: number;
  page: number;
};

export type OcrRegionApiRequest = {
  x: number;
  y: number;
  width: number;
  height: number;
  display_width: number;
  display_height: number;
  page: number;
};

export type OcrRegionApiResponse = {
  success: boolean;
  text: string;
  raw_json: Record<string, unknown> | null;
  confidence_score: string | number | null;
};

export type OcrRegionResult = {
  success: boolean;
  text: string;
  rawJson: Record<string, unknown> | null;
  confidenceScore: number | null;
};

export type ExtensionRegionMessage = {
  source: "aadpp-chrome-extension";
  type: "AADPP_OCR_REGION_SELECTED";
  payload: ExtensionRegionSelectionPayload;
};
