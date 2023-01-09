import { MigrationInterface, QueryRunner } from 'typeorm'

// eslint-disable-next-line @typescript-eslint/class-name-casing
export class milinus1610471222542 implements MigrationInterface {
  name = 'milinus1610471222542'

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "user_recipe" DROP CONSTRAINT "FK_7eae2204557aca72ea7babb35ae"`,
      undefined
    )
    await queryRunner.query(
      `ALTER TABLE "recipe" ALTER COLUMN "restrictions" SET DEFAULT '{}'`,
      undefined
    )
    await queryRunner.query(
      `ALTER TABLE "user_recipe" ADD CONSTRAINT "FK_7eae2204557aca72ea7babb35ae" FOREIGN KEY ("recipeId") REFERENCES "recipe"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      undefined
    )
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "user_recipe" DROP CONSTRAINT "FK_7eae2204557aca72ea7babb35ae"`,
      undefined
    )
    await queryRunner.query(
      `ALTER TABLE "recipe" ALTER COLUMN "restrictions" DROP DEFAULT`,
      undefined
    )
    await queryRunner.query(
      `ALTER TABLE "user_recipe" ADD CONSTRAINT "FK_7eae2204557aca72ea7babb35ae" FOREIGN KEY ("recipeId") REFERENCES "recipe"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined
    )
  }
}
