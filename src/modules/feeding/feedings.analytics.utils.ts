import {
  formateDDDate,
  formateDDNumericDate,
  formateMMDate,
  formateMMNumericDate,
  formateYYYYDate,
} from '../../app/utils/commons/formate-date';

type valueType = {
  sum: number;
  count: number;
};

export const groupCountFeedingByDateAndReturnArray = ({
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
        _sum: { quantity: number };
      },
    ) => {
      const dateItem = item.createdAt ?? new Date();
      const date: string = year
        ? month
          ? formateDDNumericDate(dateItem)
          : formateMMNumericDate(dateItem)
        : formateYYYYDate(dateItem);

      const existingData = acc.get(date);

      if (existingData) {
        existingData.count += Number(item?._count ?? 0);
        existingData.sum += Number(item?._sum?.quantity) ?? 0;
      } else {
        acc.set(date, {
          count: item?._count ?? 0,
          sum: Number(item?._sum?.quantity) ?? 0,
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
      sum: value?.sum,
    });
  });

  return returnData;
};
