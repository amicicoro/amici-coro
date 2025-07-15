import 'server-only';

import { headers } from 'next/headers';

export const extractSiteUrl = async () => {
  const host = (await headers()).get('host'); // or use request.headers.get("host") if available
  const protocol = host?.startsWith('localhost') ? 'http' : 'https';
  const siteUrl = `${protocol}://${host}`;
  return siteUrl;
};
