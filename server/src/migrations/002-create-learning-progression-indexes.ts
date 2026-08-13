import type { ObjectId } from "mongodb";
import type { Migration } from "./types.js";

type ExistingLesson = { _id: ObjectId; moduleId: ObjectId; position: number; sequenceNumber?: number };
type ExistingModule = { _id: ObjectId; position: number };

export const createLearningProgressionIndexes: Migration = {
  id: "202608120002-create-learning-progression-indexes",
  checksum: "sha256:19299151c4244e49fc89d28d0d8db1201c346870de36da3a8ad193f2d9a01860",
  async up({ connection, log }) {
    const modules = await connection.collection<ExistingModule>("modules").find().sort({ position: 1 }).toArray();
    const lessons = await connection.collection<ExistingLesson>("lessons").find().toArray();
    const modulePosition = new Map(modules.map((module) => [String(module._id), module.position]));
    lessons.sort((left, right) =>
      (modulePosition.get(String(left.moduleId)) ?? Number.MAX_SAFE_INTEGER) - (modulePosition.get(String(right.moduleId)) ?? Number.MAX_SAFE_INTEGER)
      || left.position - right.position
      || String(left._id).localeCompare(String(right._id))
    );
    for (const [index, lesson] of lessons.entries()) {
      const sequenceNumber = index + 1;
      await connection.collection("lessons").updateOne(
        { _id: lesson._id },
        {
          $set: {
            sequenceNumber,
            unlockDay: sequenceNumber,
            passingScore: 60,
            ...(index > 0 ? { prerequisiteLessonId: lessons[index - 1]._id } : {}),
          },
        }
      );
    }
    await connection.collection("lessons").createIndex({ sequenceNumber: 1 }, { unique: true, name: "sequenceNumber_1" });
    await connection.collection("lessonsubmissions").createIndex(
      { userId: 1, lessonId: 1, submissionId: 1 },
      { unique: true, name: "userId_1_lessonId_1_submissionId_1" }
    );
    log(`learning progression ready for ${lessons.length} lesson(s)`);
  },
};
