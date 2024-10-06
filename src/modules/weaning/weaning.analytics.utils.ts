import {
  formateDDDate,
  formateDDNumericDate,
  formateMMDate,
  formateMMNumericDate,
  formateYYYYDate,
} from '../../app/utils/commons/formate-date';
type valueType = {
  litter: number;
  count: number;
  farrowingLitter: number;
};

export const groupCountWeaningAnalyticsByDateAndReturnArray = ({
  data,
  year,
  month,
  lang = 'en',
}: {
  lang?: string;
  data: any;
  year?: string;
  month?: string;
}) => {
  const groupedData = data.reduce(
    (
      acc: any,
      item: {
        createdAt: Date;
        _count: number;
        _sum: { litter: number; farrowingLitter: number };
      },
    ) => {
      const dateItem = item?.createdAt ?? new Date();
      const date: string = year
        ? month
          ? formateDDNumericDate(dateItem)
          : formateMMNumericDate(dateItem)
        : formateYYYYDate(dateItem);

      const existingData = acc.get(date);

      if (existingData) {
        existingData.count += Number(item?._count ?? 0);
        existingData.litter += Number(item?._sum?.litter) ?? 0;
        existingData.farrowingLitter +=
          Number(item?._sum?.farrowingLitter) ?? 0;
      } else {
        acc.set(date, {
          count: item?._count ?? 0,
          litter: Number(item?._sum?.litter) ?? 0,
          farrowingLitter: Number(item?._sum?.farrowingLitter),
        });
      }

      return acc;
    },
    new Map<string, { value: any }>(),
  );

  const returnData = [] as any[];
  groupedData.forEach((value: valueType, key) => {
    const date = year
      ? month
        ? formateDDDate(new Date(`${year}-${month}-${Number(key)}`), lang)
        : formateMMDate(new Date(Number(year), Number(key), 0), lang)
      : key;
    returnData.push({
      date,
      dateNumeric: key,
      count: value?.count,
      litter: value?.litter,
      farrowingLitter: value?.farrowingLitter,
    });
  });

  return returnData;
};
