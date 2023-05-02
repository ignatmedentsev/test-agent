import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVetAiAnalysisRequest1680099274387 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "vet_ai_analysis_request" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdDate" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedDate" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "reqId" varchar NOT NULL, "analysisStatus" varchar NOT NULL DEFAULT 'RUNNING', "aiDispatchId" integer NOT NULL, "dataset" text NOT NULL, CONSTRAINT "UQ_d66375ac5951103defb476c2660" UNIQUE ("reqId"))`);
    await queryRunner.query(`CREATE INDEX "IDX_d66375ac5951103defb476c266" ON "vet_ai_analysis_request" ("reqId") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_d66375ac5951103defb476c266"`);
    await queryRunner.query(`DROP TABLE "vet_ai_analysis_request"`);
  }
}
