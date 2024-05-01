export const getUserAgent = (req) => {
  let userAgent = req.headers['user-agent'] as string;
  const forwardedFor = req.headers['x-forwarded-for'] as string;
  if (!userAgent && forwardedFor) {
    userAgent = forwardedFor?.split(',').at(0) ?? 'Unknown';
  }
  return userAgent ?? req.socket?.remoteAddres;
};
