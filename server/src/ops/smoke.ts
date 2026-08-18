import "dotenv/config";
import { deploymentChecks, runDeploymentSmoke } from "../lib/deploymentSmoke.js";

const apiUrl = process.env.API_URL; const appUrl = process.env.APP_URL;
if (!apiUrl || !appUrl) throw new Error("API_URL and APP_URL are required for deployment smoke tests.");
const results = await runDeploymentSmoke(deploymentChecks(apiUrl, appUrl));
for (const result of results) console.info(JSON.stringify({ type: "deployment_smoke_check", ...result }));
const failures = results.filter((result) => result.status === "failed");
console.info(JSON.stringify({ type: "deployment_smoke_summary", passed: results.length - failures.length, failed: failures.length }));
if (failures.length) process.exitCode = 1;
