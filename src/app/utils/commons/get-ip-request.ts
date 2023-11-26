// export const getIpRequest = (req) =>
//   req.headers['x-forwarded-for']?.split(',').shift() ||
//   req.socket?.remoteAddress;

export const getIpRequest = (req) => {
  let ipAddress = req.headers['x-real-ip'] as string;
  const forwardedFor = req.headers['x-forwarded-for'] as string;
  if (!ipAddress && forwardedFor) {
    ipAddress = forwardedFor?.split(',').at(0) ?? 'Unknown';
  }
  return ipAddress ?? req.socket?.remoteAddres;
};
