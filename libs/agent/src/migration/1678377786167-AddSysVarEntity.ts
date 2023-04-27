import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSysVarEntity1678377786167 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "sys_var" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL,
         "value" text NOT NULL, CONSTRAINT "UQ_46fe0b2a129ec025388e8398229" UNIQUE ("name"))`);
    await queryRunner.query(`CREATE INDEX "IDX_46fe0b2a129ec025388e839822" ON "sys_var" ("name") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_46fe0b2a129ec025388e839822"`);
    await queryRunner.query(`DROP TABLE "sys_var"`);
  }
}
