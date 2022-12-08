import Redis from 'ioredis';
import axios from 'axios';

let client = new Redis(process.env.REDIS);


let getFresh = async (headers) => {
  const { data } = await axios.post(
    `${process.env.AUTH0_ISSUER_URL}userinfo`,
    {},
    {
      headers: {
        Authorization: headers,
      },
    },
  );

  return data;
}

export default async (
  request: any,
  allowed: string[],
  detailed = false
): Promise<string | any | undefined> => {

  let processRoles = (roles) => {
    console.log(roles);


    if(allowed?.length > 0){
      if (
          (roles['https://poiw:eu:auth0:com/roles']?.filter((role) =>
              allowed?.includes(role),
          ))?.length === 0
      ){
        return;
      }
    }
      return detailed ? roles : roles['https://poiw:eu:auth0:com/app_metadata']?.username || roles.email;
  }

  if (!request?.headers || !request?.headers?.authorization) return;

  const hash = Buffer.from(request.headers.authorization).toString('base64');

  let roles = await client.get(hash);

  if(!roles){
    roles = await getFresh(request.headers.authorization);
    client.set(hash, JSON.stringify(roles));
  }else{
    roles = JSON.parse(roles);
  }

  return processRoles(roles);

};


