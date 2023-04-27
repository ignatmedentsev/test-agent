import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Phi1671177964626 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "phi" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdDate" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedDate" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "deviceId" integer NOT NULL, "studyInstanceUid" varchar NOT NULL, "dicomData" text NOT NULL)`);
    await queryRunner.query(`CREATE INDEX "IDX_eb7ab8a141f9a0d13a420bff69" ON "phi" ("studyInstanceUid") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_eb7ab8a141f9a0d13a420bff69"`);
    await queryRunner.query(`DROP TABLE "phi"`);
  }
}
