import { httpPost } from "../httpClient";

export async function getScanHistory() {
  try {
    const data = await httpPost("/assess", {}); // Get assessment results from backend
    console.log("Fetched scan history:", data);
    return data;
  } catch (error) {
    console.error("Error fetching scan history:", error);
    throw error;
  }
}
