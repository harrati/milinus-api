import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '../../app.module'

describe('Admin', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  it(`MUTATION loginAdmin success`, () => {
    const query = /* GraphQL */ `
      mutation signInAdmin {
        signInAdmin(email: "admin1@totem.paris", password: "totem") {
          token
        }
      }
    `
    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query: query })
      .expect(200)
  })

  it(`MUTATION loginAdmin failed`, async () => {
    const query = /* GraphQL */ `
      mutation signInAdmin {
        signInAdmin(
          email: "admin1@totem.paris"
          password: "not good password"
        ) {
          token
        }
      }
    `
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: query })

    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty('errors')
  })

  afterAll(async () => {
    await app.close()
  })
})
