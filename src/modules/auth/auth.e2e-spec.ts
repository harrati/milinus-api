import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '../../app.module'

describe('Auth', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  it(`MUTATION signIn`, () => {
    const query = /* GraphQL */ `
      mutation signIn {
        signIn(email: "jawad@totem.paris", password: "totem") {
          token
        }
      }
    `
    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query: query })
      .expect(200)
  })

  it(`MUTATION signIn failed`, async () => {
    const query = /* GraphQL */ `
      mutation signIn {
        signInAdmin(email: "jawad@totem.paris", password: "bad pass") {
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
