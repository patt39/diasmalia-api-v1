import axios from 'axios';

const axiosIntegration = axios.create({
  baseURL: `https://cdn.taux.live/api/latest.json`,
  headers: {
    Accept: 'application/json',
    'Accept-Language': 'it-it',
    'Content-type': 'application/json',
  },
});

export const getValueCurrencyLiveApi = async (): Promise<{
  table: string;
  rates: any;
  lastupdate: string;
}> => {
  const { data } = await axiosIntegration.get(`/`);

  return data;
};

const axiosLocation = axios.create({
  baseURL: `http://ip-api.com`,
  headers: {
    Accept: 'application/json',
    'Accept-Language': 'it-it',
    'Content-type': 'application/json',
  },
});
/** Config Json https://ip-api.com/docs/api:json */
export const getOneLocationIpApi = async (payload: { ipLocation: string }) => {
  const { ipLocation } = payload;
  const { data } = await axiosLocation.get(
    `/json/${ipLocation}?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query`,
  );

  return data;
};
