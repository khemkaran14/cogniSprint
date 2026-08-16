import type { Migration } from "./types.js";

export const createAssessmentIndexes: Migration = {
  id: "202608120004-create-assessment-indexes",
  checksum: "sha256:7c71348b8911724a8463f004a115aa4323822aa05f22e56f010b743ee36e60ed",
  async up({ connection, log }) {
    await connection.collection("assessments").createIndex({ slug: 1 }, { unique: true, name: "slug_1" });
    await connection.collection("assessments").createIndex({ month: 1 }, { unique: true, name: "month_1" });
    await connection.collection("assessmentattempts").createIndex({ userId: 1, assessmentId: 1, submissionId: 1 }, { unique: true, name: "user_assessment_submission" });
    await connection.collection("assessmentattempts").createIndex({ userId: 1, createdAt: -1 }, { name: "user_attempt_history" });
    log("assessment indexes ready");
  },
};
