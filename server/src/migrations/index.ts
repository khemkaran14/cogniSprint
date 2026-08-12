import { createApplicationIndexes } from "./001-create-application-indexes.js";
import type { Migration } from "./types.js";

export const migrations: Migration[] = [createApplicationIndexes];
