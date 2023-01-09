/* eslint-disable @typescript-eslint/camelcase */
import * as dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import merge from 'lodash/merge'

dotenv.config()

export const defaultConfig = {
  env: process.env.NODE_ENV,
  stage: process.env.STAGE,
  app: {
    name: process.env.APP_NAME,
    port: parseInt(process.env.PORT as string, 10),
  },
  graphql: {
    path: '/graphql',
    playground: true,
    introspection: true,
  },
  typeorm: {
    type: process.env.TYPEORM_CONNECTION,
    host: process.env.TYPEORM_HOST,
    port: parseInt(
      process.env.NODE_ENV === 'test'
        ? (process.env.TYPEORM_PORT_TEST as string)
        : (process.env.TYPEORM_PORT as string),
      10
    ),
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
    synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
    entities:
      process.env.NODE_ENV === 'test'
        ? [path.join(__dirname, '../modules/**/*.entity.ts')]
        : [
            path.join(__dirname, '../..', process.env
              .TYPEORM_ENTITIES as string),
            path.join(__dirname, '../modules/**/*.entity.ts'),
          ],
    // migrationsTableName: 'milinus_migrations',
    // migrations: ['src/migration/*.js'],
    // cli: {
    //   migrationsDir: 'migration',
    // },
    // migrationsRun: false,
    logging: ['error'],
  },
  bcrypt: {
    salt: 5,
  },
  jwt: {
    scheme: 'Bearer',
    secret: process.env.JWT_SECRET,
    expiresIn: '100d',
  },
  facebook: {
    clientId: '1121410841560338',
    clientSecret: '9929088c362d7a882cc2c05c043c0b78',
  },
  apple: {
    teamId: '5TZ3D53F6Y',
    keyIdentifier: '42PFKXKQTL',
    privateKey:
      'LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JR1RBZ0VBTUJNR0J5cUdTTTQ5QWdFR0NDcUdTTTQ5QXdFSEJIa3dkd0lCQVFRZ3RvWE5vdkNkb1pva2txR2MKMURCdjgvOEtQeXRwK3AvQ0Z0bkxlWWZaMzdPZ0NnWUlLb1pJemowREFRZWhSQU5DQUFSWjNDT28wQlA4blRTZQorY1JWaUNtYUxrK3VxNkw4OS9NSUxvUWE4WXNmZUNYdm5RRVJPb0NkNWdkZnJqTGFIRlFoM0F1eTZvaUxVRUdoCnV6RlduUmp4Ci0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS0=',
  },
  firebase: {
    webApiKey: 'AIzaSyBhXuKNGRNnuoB8hm7z6hJ3-8XPQV82GAA',
    dynamicLinks: {
      domainUriPrefix: 'https://milinus.page.link',
      shortLinksUrl:
        'https://firebasedynamiclinks.googleapis.com/v1/shortLinks',
    },
    credentials: {
      type: 'service_account',
      project_id: 'milinus',
      private_key_id: '1a1d4549b1663470778ac45a56b4e6d6448f6e64',
      private_key:
        '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCF1Kpx47fe6a9j\nEWbqppEHTFCPO3+c8qgbV1AP4iNyyp7odA78qIS4GJZd8HXZMHt/79i2k0tuU5a5\nDWunG5CIIeY609okUNPV4KMalVSsioPFd21vB+AH+0hbijJhtzV03estcnUX3+s6\nCYhE9UnSx9CCEri+bw4hdcdvGjLrH+OZIphVxFE9xKJlXGKHNAclN+RfxdXjC7yj\nby848HDi9GhsI67EHldwgRzsiltGjisftUYFdec1HCX8ZuujWYVq2oTA+Exe8RXd\ns0+grvyv/zJozu/OQHwLOsGeYld0NJe7Ol76Zwuh88IqPbk/q8NkotwotbHhv7p8\nuxeHoBirAgMBAAECggEAEJQYKzSY5fnP2rdgpufMZnmLLzshI1mh/oUR623Jk2JL\nTiN2adEcY8vT8L4lcyrA2cfl8jQL75ZWQQVLFS/idyKv6RCuYLpMi52gxt3B1//u\ns+sH+O2iUIrN210iwZ0W96u4AvC/VZ5M/usIYPZ71ysehsZ38UtDllyHQJmfviWO\nx3U8NcZDL8NM80+4ZAD1+uDw5fFI31SRKK3I1mBisUIWPBeplenTwFHvcj5oo60x\nh2gaKfXoyHbByUYzXOJAoO696LghfcH9ydkqvUEfYyVaQJrt1+BVnt1Jcw1bsIzI\nBrxIz2EzVyPpSOg63PZZ6JyQ89NBU28/rzAlwkqI5QKBgQC84E2V5MIaYtcKDcGY\nNNZsMFWWsGuRWwHJku8PUN4kYxdcEJDmMtrXO+YdIMwBgVxQX3Lp1yLgYmweJSUb\n5jidkWf5IMuP18gve3xj82fMaQ2P24IpZVlKHFbJ5VdXH6MxWrKaGAPjK2wxvRpL\nodlejqYMhGNjw59w/tGUm1itfQKBgQC1ZGb4WcEFbTGm9EVERKtVnul37U8cYukn\n07j6XIwLlZzExbdnQSQq64mt4isETDFDwKIrrmyrxpPlN3rt1ZQkbx9d11MW77Us\nM9zQAlu2SJeAVw68U0wl1YJpItOC8U2iHZuSADONW4uSOruI0sZOGhFiYjzbpa8M\ncjP2WeTXRwKBgD6caHvA+ms+yqQljUCEe3Qfza+HShFERuJoV+EO4KTVSGAXicEV\nqJ/i1lRfk+EH3e8yxOgpjgEt/0M68wM9nRT2p63ZJkHHuS+sUr7baFRFmt5OWOaa\nFzBPFqIU6ZATB8kLlNsqDNfYhCQ02Kurul/zD65kkIH4zjjp79XAbXQNAoGAb61i\nDBNOWGXzBOQtZSuWBP/yo8hyRXrMK54Zq+Kgwl0ZiLhmA2dCuj4LpQezDlFOn3UR\nIy2fcF6xHZV71MQDEi9sM11npZ5tf8pqb5KUHnUw+W4f/2iVYFHEmbA8Ysjn0CDE\ncC45jxVGqAALB+ElAF7iRx1OdLjcPiBtx4Vu8+8CgYA3aLyDY7uRRNmIrL8fswAU\n4IAuVIu5kly+HL704kjpTMR/zq2oDeM7sXb9/u0sIVd+R8tQ+8D0VhJeiTop5sJb\nfl5Ba01Tf831M2Q409ZnMz2SmAGJaaV1tMd9XSUuHFDLKhw/4X8YiV5/CTDy+v1z\n5By23axDJ5Lmkb+AkQ1F2w==\n-----END PRIVATE KEY-----\n',
      client_email: 'firebase-adminsdk-891lq@milinus.iam.gserviceaccount.com',
      client_id: '104457829459146196725',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url:
        'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-891lq%40milinus.iam.gserviceaccount.com',
    },
  },
  release: {
    ios: { bundleId: 'com.totem.milinus' },
    android: { packageName: 'com.totem.milinus' },
    frontUrl: 'https://milinus.fr/fr',
  },
  mailjet: {
    credentials: {
      publicKey: '76ce2e9ee63e40e646f901bcc388c9c4',
      privateKey: 'acc06ecd42075cce49d8ad1f0122a855',
    },
    connectParams: {
      url: 'api.mailjet.com',
      version: 'v3.1',
      perform_api_call: true,
    },
    requestParams: {
      FromEmail: 'appli.milinus@gmail.com',
      FromName: 'Le coach Milinus',
    },
    templates: {
      contact: {
        TemplateID: 1584622,
        Subject: 'Contact',
      },
      createPassword: {
        TemplateID: 1583159,
        Subject: 'Create Password',
      },
      resetPassword: {
        TemplateID: 1302828,
        Subject: 'Reset password',
      },
      welcome: {
        TemplateID: 1308704,
        Subject: 'Welcome',
      },
      deletedContent: {
        TemplateID: 1596355,
        Subject: 'Deleted content',
      },
      userBan: {
        TemplateID: 1596337,
        Subject: 'User Ban',
      },
      dataRequest: {
        TemplateId: 1619376,
        Subject: 'Data Request',
      },
      resetPasswordEN: {
        TemplateID: 1940139,
        Subject: 'Reset password',
      },
      welcomeEN: {
        TemplateID: 1940082,
        Subject: 'Welcome',
      },
      deletedContentEN: {
        TemplateID: 1940303,
        Subject: 'Deleted content',
      },
      userBanEN: {
        TemplateID: 1940247,
        Subject: 'User Ban',
      },
      dataRequestEN: {
        TemplateId: 1944886,
        Subject: 'Data Request',
      },
    },
  },
  url: {
    api: 'http://localhost:3000',
    backOffice: 'http://localhost:5090',
  },
  assets: {
    watermark: 'assets/logo.png',
  },
  notification: {
    FR: {
      PLANET:
        'Félicitations, tu as débloqué une nouvelle planète, tu peux retrouver ta progression dans ton profil',
      NO_PROGRAM:
        'Hey %(firstName)s, réponds aux questions du coach Milinus, il te trouvera un programme adapté à ton objectif',
      HALF_PROGRAM:
        'Vous avez fait 50% de votre programme, abandonner n’est pas une option',
      OFFER:
        'Hey, prêt à te transformer ? Fais toi aider du coach milinus. Un programme sur mesure et évolutif. Une liste de recette pour optimiser tes efforts. C’est par ici.',
      FOLLOW: '%(firstName)s a commencé à te suivre',
      COMMENT: '%(firstName)s a commenté votre contenu',
      LIKE: '%(firstName)s a réagi à votre contenu',
      DELETE_COMMENT:
        'Ton commentaire a été supprimé par un membre de la communauté',
      DELETE_PUBLICATION:
        'Ta publication a été supprimée par un membre de la communauté',
    },
    EN: {
      PLANET:
        'Great!! you have just unlocked a planet. Go to the treasure room and share your rewards with the milinus community.',
      NO_PROGRAM:
        'Hey %(firstName)s, answer the questions of coach Milinus, he will find you a program adapted to your objective',
      HALF_PROGRAM:
        'You have completed 50% of your program, dropping out is not an option.',
      OFFER:
        'Hey, ready to transform? Get help from coach Milinus. A tailor-made and evolving program. A list of recipes to optimize your efforts. Its this way',
      FOLLOW: '%(firstName)s started to follow you',
      COMMENT: '%(firstName)s commented your publication',
      LIKE: '%(firstName)s reacts to your publication',
      DELETE_COMMENT:
        'Your comment has been removed following a report from a community member',
      DELETE_PUBLICATION:
        'Your publication has been removed following a report from a community member',
    },
  },
}

export const config = () => {
  const envConfig = fs
    .readFileSync(path.join(__dirname, `${process.env.STAGE}.json`))
    .toString()
  return merge(defaultConfig, JSON.parse(envConfig))
}
