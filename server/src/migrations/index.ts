import { createApplicationIndexes } from "./001-create-application-indexes.js";
import { createLearningProgressionIndexes } from "./002-create-learning-progression-indexes.js";
import { createAnalyticsIndexes } from "./003-create-analytics-indexes.js";
import { createAssessmentIndexes } from "./004-create-assessment-indexes.js";
import { createCertificateDeliveryIndexes } from "./005-create-certificate-delivery-indexes.js";
import { createSessionManagementIndexes } from "./006-create-session-management-indexes.js";
import { createAdminAuditIndexes } from "./007-create-admin-audit-indexes.js";
import { createOrderHistoryIndexes } from "./008-create-order-history-indexes.js";
import { createRefundIndexes } from "./009-create-refund-indexes.js";
import type { Migration } from "./types.js";

export const migrations: Migration[] = [createApplicationIndexes, createLearningProgressionIndexes, createAnalyticsIndexes, createAssessmentIndexes, createCertificateDeliveryIndexes, createSessionManagementIndexes, createAdminAuditIndexes, createOrderHistoryIndexes, createRefundIndexes];
