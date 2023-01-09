import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '../../app.module'
import { range } from 'lodash'

describe('Program', () => {
  let app: INestApplication
  let token: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()

    const query = /* GraphQL */ `
      mutation signIn {
        signIn(email: "jawad@totem.paris", password: "totem") {
          token
        }
      }
    `
    token = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: query })
      .then(response => {
        return response.body.data.signIn.token
      })
  })

  const generateQuery = (first = 8, after = '', type = 'programs') => {
    const query = /* GraphQL */ `
    query ${type} {
      ${type}(
        first: ${first}
        after: "${after}"
      ) {
        edges {
          node {
            uuid
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        aggregate {
          count
        }
      }
    }
    `
    return query
  }

  it(`QUERY programs`, async () => {
    const query = generateQuery(8, '')
    const queryName = 'programs'
    // eslint-disable-next-line prefer-const
    let initialData = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer ' + token)
      .send({ query: query })
      .expect(200)
      .then(response => {
        return response.body.data[queryName].edges
      })

    let after = ''

    for (const x of range(2, 8, 2)) {
      await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', 'Bearer ' + token)
        .send({ query: generateQuery(2, after, queryName) })
        .expect(200)
        .then(response => {
          expect(response.body.data[queryName].edges[0].node.uuid).toEqual(
            initialData[x - 2].node.uuid
          )
          expect(response.body.data[queryName].edges[1].node.uuid).toEqual(
            initialData[x - 1].node.uuid
          )
          after = response.body.data[queryName].pageInfo.endCursor
        })
    }

    return initialData
  })

  afterAll(async () => {
    await app.close()
  })
})
