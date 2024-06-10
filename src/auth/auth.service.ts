import { Injectable } from '@nestjs/common';
import { AuthenticationClient, ManagementClient } from 'auth0';
import * as jose from 'jose'

@Injectable()
export class AuthService {



  private jwks = {
    default: jose.createRemoteJWKSet(new URL('https://poiw.eu.auth0.com/.well-known/jwks.json'))
  }

  private readonly auth = new AuthenticationClient({
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
  })

  private readonly management = new ManagementClient({
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    headers: {
      scope: 'read:clients read:client_keys'
    }
  })

  async validateToken(token: string) {
    const { payload, protectedHeader } = await jose.jwtVerify(token, this.jwks.default)

    return payload
  }

  async getUser(id: string){
    return this.management.users.get({id}).then(({ data }) => data)
  }

}
