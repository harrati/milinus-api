import { MigrationInterface, QueryRunner } from 'typeorm'

// eslint-disable-next-line @typescript-eslint/class-name-casing
export class test1607942620934 implements MigrationInterface {
  name = 'test1607942620934'

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "training" DROP CONSTRAINT "FK_42d1df88d1a56525918e3d6d488"`,
      undefined
    )
    await queryRunner.query(
      `ALTER TABLE "training" ADD CONSTRAINT "FK_42d1df88d1a56525918e3d6d488" FOREIGN KEY ("trainingGroupId") REFERENCES "training_group"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      undefined
    )
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "training" DROP CONSTRAINT "FK_42d1df88d1a56525918e3d6d488"`,
      undefined
    )
    await queryRunner.query(
      `ALTER TABLE "training" ADD CONSTRAINT "FK_42d1df88d1a56525918e3d6d488" FOREIGN KEY ("trainingGroupId") REFERENCES "training_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined
    )
  }
}
