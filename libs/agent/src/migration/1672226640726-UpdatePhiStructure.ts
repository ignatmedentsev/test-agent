import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePhiStructure1672226640726 implements MigrationInterface {
  name = 'UpdatePhiStructure1672226640726';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_eb7ab8a141f9a0d13a420bff69"`);
    await queryRunner.query(`DROP TABLE "phi"`);
    await queryRunner.query(`CREATE TABLE "phi" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdDate" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedDate" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "deviceId" integer NOT NULL, "sopInstanceUid" varchar NOT NULL, "dicomData" text NOT NULL)`);
    await queryRunner.query(`CREATE INDEX "IDX_ce73656ae701b4fe0264be3568" ON "phi" ("sopInstanceUid") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_ce73656ae701b4fe0264be3568"`);
    await queryRunner.query(`DROP TABLE "phi"`);
    await queryRunner.query(`CREATE TABLE "phi" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdDate" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedDate" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "deviceId" integer NOT NULL, "studyInstanceUid" varchar NOT NULL, "dicomData" text NOT NULL)`);
    await queryRunner.query(`CREATE INDEX "IDX_eb7ab8a141f9a0d13a420bff69" ON "phi" ("studyInstanceUid") `);
  }
}
