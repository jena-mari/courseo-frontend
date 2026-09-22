import { setTimeout } from "node:timers/promises";

const siteUrl = process.env.COURSEO_SITE_URL;
const expected = process.env.GITHUB_SHA;
if (!siteUrl || !expected) {
  throw new Error("Set the GitHub Actions COURSEO_SITE_URL variable to the public frontend URL. A deploy request alone does not confirm a live release.");
}
const url = new URL("version.json", `${siteUrl.replace(/\/$/, "")}/`);
const deadline = Date.now() + 20 * 60_000;
while (Date.now() < deadline) {
  url.searchParams.set("check", String(Date.now()));
  try {
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const version = await response.json();
    if (version.revision === expected) {
      console.log(`Verified live revision ${expected} at ${siteUrl}`);
      process.exit(0);
    }
    console.log("Waiting for Render to serve the requested revision…");
  } catch (error) {
    console.log(`Waiting for the deployment marker: ${error.message}`);
  }
  await setTimeout(15_000);
}
throw new Error(`The site did not serve revision ${expected} within 20 minutes. Check the Render build logs, branch, and service URL.`);
