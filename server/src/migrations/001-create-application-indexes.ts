import { AccountToken } from "../models/AccountToken.js";
import { BlogArticle } from "../models/BlogArticle.js";
import { Certificate } from "../models/Certificate.js";
import { Coupon } from "../models/Coupon.js";
import { Entitlement } from "../models/Entitlement.js";
import { FaqItem } from "../models/FaqItem.js";
import { Lesson } from "../models/Lesson.js";
import { LessonProgress } from "../models/LessonProgress.js";
import { CurriculumModule } from "../models/Module.js";
import { Order } from "../models/Order.js";
import { Price } from "../models/Price.js";
import { Product } from "../models/Product.js";
import { Session } from "../models/Session.js";
import { User } from "../models/User.js";
import { WebhookEvent } from "../models/WebhookEvent.js";
import type { Migration } from "./types.js";

const models = [
  AccountToken, BlogArticle, Certificate, Coupon, Entitlement, FaqItem, Lesson,
  LessonProgress, CurriculumModule, Order, Price, Product, Session, User, WebhookEvent,
];

export const createApplicationIndexes: Migration = {
  id: "202608120001-create-application-indexes",
  checksum: "sha256:981a5c92027ad701d36b392220775932867f8efcaae18f0678036c086760d237",
  async up({ log }) {
    // createIndexes is additive: it does not silently remove indexes that may be
    // supporting production traffic. Destructive index changes need a dedicated migration.
    for (const applicationModel of models) {
      await applicationModel.createIndexes();
      log(`indexes ready: ${applicationModel.collection.collectionName}`);
    }
  },
};
