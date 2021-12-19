import axios from 'axios';

export default async (
  request: any,
  allowed: string[],
  detailed = false
): Promise<string | any | undefined> => {
  if (!request?.headers || !request?.headers?.authorization) return;

  const { data } = await axios.post(
    `${process.env.AUTH0_ISSUER_URL}userinfo`,
    {},
    {
      headers: {
        Authorization: request.headers.authorization,
      },
    },
  );
  if(allowed.length > 0){
    if (
        (data['https://poiw:eu:auth0:com/roles']?.filter((role) =>
            allowed.includes(role),
        )).length === 0
    ) return;
  }
  else return detailed ? data : data['https://poiw:eu:auth0:com/app_metadata']?.username || data.email;;
};
