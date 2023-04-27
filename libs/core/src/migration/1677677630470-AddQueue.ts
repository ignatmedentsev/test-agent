import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQueue1677677630470 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "queue" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdDate" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedDate" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "type" varchar NOT NULL, "modifier" varchar NOT NULL DEFAULT (''), "payload" text NOT NULL, "priority" varchar NOT NULL DEFAULT ('5_normal'), "sort" varchar NOT NULL DEFAULT (''), "status" varchar NOT NULL DEFAULT ('PENDING'), "error" varchar NOT NULL DEFAULT (''), "attempt" integer)`);
    await queryRunner.query(`CREATE INDEX "IDX_bbbee6cb68edb7110e706a25d5" ON "queue" ("type") `);
    await queryRunner.query(`CREATE INDEX "IDX_a1c0fc76dfe64453dc6b3c1f82" ON "queue" ("modifier") `);
    await queryRunner.query(`CREATE INDEX "IDX_422cb86cda1b8ce9f5b859c419" ON "queue" ("priority") `);
    await queryRunner.query(`CREATE INDEX "IDX_9500cde9553f66b818793fbded" ON "queue" ("sort") `);
    await queryRunner.query(`CREATE INDEX "IDX_9b4250f921befe0b2af211b459" ON "queue" ("status") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_9b4250f921befe0b2af211b459"`);
    await queryRunner.query(`DROP INDEX "IDX_9500cde9553f66b818793fbded"`);
    await queryRunner.query(`DROP INDEX "IDX_422cb86cda1b8ce9f5b859c419"`);
    await queryRunner.query(`DROP INDEX "IDX_a1c0fc76dfe64453dc6b3c1f82"`);
    await queryRunner.query(`DROP INDEX "IDX_bbbee6cb68edb7110e706a25d5"`);
    await queryRunner.query(`DROP TABLE "queue"`);
  }
}
