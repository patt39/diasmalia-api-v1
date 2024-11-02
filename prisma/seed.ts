import { PrismaClient } from '@prisma/client';
import { parseArgs } from 'node:util';
const prisma = new PrismaClient();

const options = {
  environment: { type: 'string' } as const,
};

async function main() {
  const {
    values: { environment },
  } = parseArgs({ options });

  switch (environment) {
    case 'development':
      /** Seedind countries */
      await prisma.country.createMany({
        data: [
          { name: 'Afghanistan', code: 'AF' },
          { name: 'Albania', code: 'AL' },
          { name: 'Algeria', code: 'DZ' },
          { name: 'Andorra', code: 'AD' },
          { name: 'Angola', code: 'AO' },
          { name: 'Antigua and Barbuda', code: 'AG' },
          { name: 'Argentina', code: 'AR' },
          { name: 'Armenia', code: 'AM' },
          { name: 'Australia', code: 'AU' },
          { name: 'Austria', code: 'AT' },
          { name: 'Azerbaijan', code: 'AZ' },
          { name: 'Bahamas', code: 'BS' },
          { name: 'Bahrain', code: 'BH' },
          { name: 'Bangladesh', code: 'BD' },
          { name: 'Barbados', code: 'BB' },
          { name: 'Belarus', code: 'BY' },
          { name: 'Belgium', code: 'BE' },
          { name: 'Belize', code: 'BZ' },
          { name: 'Benin', code: 'BJ' },
          { name: 'Bhutan', code: 'BT' },
          { name: 'Bolivia', code: 'BO' },
          { name: 'Bosnia and Herzegovina', code: 'BA' },
          { name: 'Botswana', code: 'BW' },
          { name: 'Brazil', code: 'BR' },
          { name: 'Brunei Darussalam', code: 'BN' },
          { name: 'Bulgaria', code: 'BG' },
          { name: 'Burkina Faso', code: 'BF' },
          { name: 'Burundi', code: 'BI' },
          { name: 'Cambodia', code: 'KH' },
          { name: 'Cameroon', code: 'CM' },
          { name: 'Canada', code: 'CA' },
          { name: 'Cape Verde', code: 'CV' },
          { name: 'Central African Republic', code: 'CF' },
          { name: 'Chad', code: 'TD' },
          { name: 'Chile', code: 'CL' },
          { name: 'China', code: 'CN' },
          { name: 'Colombia', code: 'CO' },
          { name: 'Comoros', code: 'KM' },
          { name: 'Congo', code: 'CG' },
          { name: 'Costa Rica', code: 'CR' },
          { name: 'Croatia', code: 'HR' },
          { name: 'Cuba', code: 'CU' },
          { name: 'Cyprus', code: 'CY' },
          { name: 'Czech Republic', code: 'CZ' },
          { name: 'Democratic Republic of the Congo', code: 'CD' },
          { name: 'Denmark', code: 'DK' },
          { name: 'Djibouti', code: 'DJ' },
          { name: 'Dominica', code: 'DM' },
          { name: 'Dominican Republic', code: 'DO' },
          { name: 'Ecuador', code: 'EC' },
          { name: 'Egypt', code: 'EG' },
          { name: 'El Salvador', code: 'SV' },
          { name: 'Equatorial Guinea', code: 'GQ' },
          { name: 'Eritrea', code: 'ER' },
          { name: 'Estonia', code: 'EE' },
          { name: 'Eswatini', code: 'SZ' },
          { name: 'Ethiopia', code: 'ET' },
          { name: 'Fiji', code: 'FJ' },
          { name: 'Finland', code: 'FI' },
          { name: 'France', code: 'FR' },
          { name: 'Gabon', code: 'GA' },
          { name: 'Gambia', code: 'GM' },
          { name: 'Germany', code: 'DE' },
          { name: 'Ghana', code: 'GH' },
          { name: 'Greece', code: 'GR' },
          { name: 'Grenada', code: 'GD' },
          { name: 'Guatemala', code: 'GT' },
          { name: 'Guinea', code: 'GN' },
          { name: 'Guinea-Bissau', code: 'GW' },
          { name: 'Guyana', code: 'GY' },
          { name: 'Haiti', code: 'HT' },
          { name: 'Honduras', code: 'HN' },
          { name: 'Hungary', code: 'HU' },
          { name: 'Iceland', code: 'IS' },
          { name: 'India', code: 'IN' },
          { name: 'Indonesia', code: 'ID' },
          { name: 'Iran', code: 'IR' },
          { name: 'Iraq', code: 'IR' },
          { name: 'Ireland', code: 'IE' },
          { name: 'Israel', code: 'IL' },
          { name: 'Italy', code: 'IT' },
          { name: 'Jamaica', code: 'JM' },
          { name: 'Japan', code: 'JP' },
          { name: 'Jordan', code: 'JO' },
          { name: 'Kazakhstan', code: 'KZ' },
          { name: 'Kenya', code: 'KE' },
          { name: 'Kiribati', code: 'KI' },
          { name: 'Korea (North)', code: 'KP' },
          { name: 'Korea (South)', code: 'KR' },
          { name: 'Kuwait', code: 'KW' },
          { name: 'Kyrgyzstan', code: 'KG' },
          { name: 'Laos', code: 'LA' },
          { name: 'Latvia', code: 'LV' },
          { name: 'Lebanon', code: 'LB' },
          { name: 'Lesotho', code: 'LS' },
          { name: 'Liberia', code: 'LR' },
          { name: 'Libya', code: 'LY' },
          { name: 'Liechtenstein', code: 'LI' },
          { name: 'Lithuania', code: 'LT' },
          { name: 'Luxembourg', code: 'LU' },
          { name: 'Madagascar', code: 'MG' },
          { name: 'Malawi', code: 'MW' },
          { name: 'Malaysia', code: 'MY' },
          { name: 'Maldives', code: 'MV' },
          { name: 'Mali', code: 'ML' },
          { name: 'Malta', code: 'MT' },
          { name: 'Marshall Islands', code: 'MH' },
          { name: 'Mauritania', code: 'MR' },
          { name: 'Mauritius', code: 'MU' },
          { name: 'Mexico', code: 'MX' },
          { name: 'Micronesia', code: 'FM' },
          { name: 'Moldova', code: 'MD' },
          { name: 'Monaco', code: 'MC' },
          { name: 'Mongolia', code: 'ME' },
          { name: 'Montenegro', code: 'CGO' },
          { name: 'Morocco', code: 'MA' },
          { name: 'Mozambique', code: 'MZ' },
          { name: 'Myanmar', code: 'MM' },
          { name: 'Namibia', code: 'NA' },
          { name: 'Nauru', code: 'NR' },
          { name: 'Nepal', code: 'NP' },
          { name: 'Netherlands', code: 'NL' },
          { name: 'New Zealand', code: 'NZ' },
          { name: 'Nicaragua', code: 'NI' },
          { name: 'Niger', code: 'NE' },
          { name: 'Nigeria', code: 'NG' },
          { name: 'North Macedonia', code: 'MK' },
          { name: 'Norway', code: 'NO' },
          { name: 'Oman', code: 'OM' },
          { name: 'Pakistan', code: 'PK' },
          { name: 'Palau', code: 'PW' },
          { name: 'Panama', code: 'PQ' },
          { name: 'Papua New Guinea', code: 'PG' },
          { name: 'Paraguay', code: 'PY' },
          { name: 'Peru', code: 'PE' },
          { name: 'Philippines', code: 'PH' },
          { name: 'Poland', code: 'PL' },
          { name: 'Portugal', code: 'PT' },
          { name: 'Qatar', code: 'QA' },
          { name: 'Romania', code: 'RO' },
          { name: 'Russia', code: 'RU' },
          { name: 'Rwanda', code: 'RW' },
          { name: 'Saint Kitts and Nevis', code: 'KN' },
          { name: 'Saint Lucia', code: 'LC' },
          { name: 'Saint Vincent and the Grenadines', code: 'VC' },
          { name: 'Samoa', code: 'WS' },
          { name: 'San Marino', code: 'CGO' },
          { name: 'Sao Tome and Principe', code: 'ST' },
          { name: 'Saudi Arabia', code: 'SA' },
          { name: 'Senegal', code: 'SN' },
          { name: 'Serbia', code: 'RS' },
          { name: 'Seychelles', code: 'SC' },
          { name: 'Sierra Leone', code: 'SG' },
          { name: 'Singapore', code: 'SG' },
          { name: 'Slovakia', code: 'SK' },
          { name: 'Slovenia', code: 'SI' },
          { name: 'Solomon Islands', code: 'SB' },
          { name: 'Somalia', code: 'SO' },
          { name: 'South Africa', code: 'ZA' },
          { name: 'South Sudan', code: 'SS' },
          { name: 'Spain', code: 'ES' },
          { name: 'Sri Lanka', code: 'LK' },
          { name: 'Sudan', code: 'SD' },
          { name: 'Suriname', code: 'SR' },
          { name: 'Sweden', code: 'SE' },
          { name: 'Switzerland', code: 'CH' },
          { name: 'Syria', code: 'SY' },
          { name: 'Taiwan', code: 'TW' },
          { name: 'Tajikistan', code: 'TJ' },
          { name: 'Tanzania', code: 'TZ' },
          { name: 'Thailand', code: 'TH' },
          { name: 'Timor-Leste', code: 'TL' },
          { name: 'Togo', code: 'TG' },
          { name: 'Tonga', code: 'TO' },
          { name: 'Trinidad and Tobago', code: 'IT' },
          { name: 'Tunisia', code: 'TN' },
          { name: 'Turkey', code: 'TR' },
          { name: 'Turkmenistan', code: 'TM' },
          { name: 'Tuvalu', code: 'TV' },
          { name: 'Uganda', code: 'UG' },
          { name: 'Ukraine', code: 'UA' },
          { name: 'United Arab Emirates', code: 'AE' },
          { name: 'United Kingdom', code: 'GB' },
          { name: 'United States', code: 'US' },
          { name: 'Uruguay', code: 'UY' },
          { name: 'Uzbekistan', code: 'UZ' },
          { name: 'Vanuatu', code: 'VU' },
          { name: 'Vatican City', code: 'VA' },
          { name: 'Venezuela', code: 'VE' },
          { name: 'Vietnam', code: 'VN' },
          { name: 'Yemen', code: 'YE' },
          { name: 'Zambia', code: 'ZM' },
          { name: 'Zimbabwe', code: 'ZW' },
        ],
        skipDuplicates: true,
      });

      /** Seedind animal breeds */
      await prisma.breed.createMany({
        data: [
          {
            name: 'Large White ',
            animalTypeId: '3204534e-2605-4975-b054-59f21bda8f74',
          },
          {
            name: 'Landrace',
            animalTypeId: '3204534e-2605-4975-b054-59f21bda8f74',
          },
          {
            name: 'Duroc ',
            animalTypeId: '3204534e-2605-4975-b054-59f21bda8f74',
          },
          {
            name: 'Berkshire',
            animalTypeId: '3204534e-2605-4975-b054-59f21bda8f74',
          },
          {
            name: 'Hampshire',
            animalTypeId: '3204534e-2605-4975-b054-59f21bda8f74',
          },
          {
            name: 'Pietrain',
            animalTypeId: '3204534e-2605-4975-b054-59f21bda8f74',
          },
          {
            name: 'Tamworth',
            animalTypeId: '3204534e-2605-4975-b054-59f21bda8f74',
          },
          {
            name: 'Chester White',
            animalTypeId: '3204534e-2605-4975-b054-59f21bda8f74',
          },
          {
            name: 'Gloucestershire Old Spot',
            animalTypeId: '3204534e-2605-4975-b054-59f21bda8f74',
          },
          {
            name: 'Vietnamese Pot-bellied Pig',
            animalTypeId: '3204534e-2605-4975-b054-59f21bda8f74',
          },
          {
            name: 'Meishan',
            animalTypeId: '3204534e-2605-4975-b054-59f21bda8f74',
          },
          {
            name: 'Mangalitsa',
            animalTypeId: '3204534e-2605-4975-b054-59f21bda8f74',
          },
          {
            name: 'Hereford',
            animalTypeId: '3204534e-2605-4975-b054-59f21bda8f74',
          },
          {
            name: 'Kunekune',
            animalTypeId: '3204534e-2605-4975-b054-59f21bda8f74',
          },
          {
            name: 'Poland China',
            animalTypeId: '3204534e-2605-4975-b054-59f21bda8f74',
          },
          {
            name: 'Red Wattle',
            animalTypeId: '3204534e-2605-4975-b054-59f21bda8f74',
          },
          {
            name: 'Iberian (Pata Negra)',
            animalTypeId: '3204534e-2605-4975-b054-59f21bda8f74',
          },
          {
            name: 'American Guinea Hog',
            animalTypeId: '3204534e-2605-4975-b054-59f21bda8f74',
          },
          {
            name: 'Fauve de Bourgogne',
            animalTypeId: '39273328-71fb-405f-8535-2ee913d8d488',
          },
          {
            name: 'Néo-Zélandais',
            animalTypeId: '39273328-71fb-405f-8535-2ee913d8d488',
          },
          {
            name: 'Californien',
            animalTypeId: '39273328-71fb-405f-8535-2ee913d8d488',
          },
          {
            name: 'Chinchilla',
            animalTypeId: '39273328-71fb-405f-8535-2ee913d8d488',
          },
          {
            name: 'Satin',
            animalTypeId: '39273328-71fb-405f-8535-2ee913d8d488',
          },
          {
            name: 'Blanc de Hotot',
            animalTypeId: '39273328-71fb-405f-8535-2ee913d8d488',
          },
          {
            name: 'Argenté de Champagne',
            animalTypeId: '39273328-71fb-405f-8535-2ee913d8d488',
          },
          {
            name: 'Géant des Flandres',
            animalTypeId: '39273328-71fb-405f-8535-2ee913d8d488',
          },
          {
            name: 'Papillon Français',
            animalTypeId: '39273328-71fb-405f-8535-2ee913d8d488',
          },
          {
            name: 'Rex',
            animalTypeId: '39273328-71fb-405f-8535-2ee913d8d488',
          },
          {
            name: 'Boer',
            animalTypeId: 'fed212d5-7ce8-4e02-912f-c2dfcd151f13',
          },
          {
            name: 'Kiko',
            animalTypeId: 'fed212d5-7ce8-4e02-912f-c2dfcd151f13',
          },
          {
            name: 'Savannah',
            animalTypeId: 'fed212d5-7ce8-4e02-912f-c2dfcd151f13',
          },
          {
            name: 'Myotonic',
            animalTypeId: 'fed212d5-7ce8-4e02-912f-c2dfcd151f13',
          },
          {
            name: 'Spanish Goat ',
            animalTypeId: 'fed212d5-7ce8-4e02-912f-c2dfcd151f13',
          },
          {
            name: 'Alpine',
            animalTypeId: 'fed212d5-7ce8-4e02-912f-c2dfcd151f13',
          },
          {
            name: 'Nubienne',
            animalTypeId: 'fed212d5-7ce8-4e02-912f-c2dfcd151f13',
          },
          {
            name: 'Toggenbourg',
            animalTypeId: 'fed212d5-7ce8-4e02-912f-c2dfcd151f13',
          },
          {
            name: 'Barbari',
            animalTypeId: 'fed212d5-7ce8-4e02-912f-c2dfcd151f13',
          },
          {
            name: 'Beetal',
            animalTypeId: 'fed212d5-7ce8-4e02-912f-c2dfcd151f13',
          },
          {
            name: 'Chèvre Pygmée',
            animalTypeId: 'fed212d5-7ce8-4e02-912f-c2dfcd151f13',
          },
          {
            name: 'Nigerian Dwarf',
            animalTypeId: 'fed212d5-7ce8-4e02-912f-c2dfcd151f13',
          },
          {
            name: 'Texel',
            animalTypeId: '48ae8f1b-66d5-48cb-b7a7-0678edd720d9',
          },
          {
            name: 'Suffolk',
            animalTypeId: '48ae8f1b-66d5-48cb-b7a7-0678edd720d9',
          },
          {
            name: 'Charollais',
            animalTypeId: '48ae8f1b-66d5-48cb-b7a7-0678edd720d9',
          },
          {
            name: 'Charollais',
            animalTypeId: '48ae8f1b-66d5-48cb-b7a7-0678edd720d9',
          },
          {
            name: 'Dorper',
            animalTypeId: '48ae8f1b-66d5-48cb-b7a7-0678edd720d9',
          },
          {
            name: 'Dorset',
            animalTypeId: '48ae8f1b-66d5-48cb-b7a7-0678edd720d9',
          },
          {
            name: 'Ile-de-France',
            animalTypeId: '48ae8f1b-66d5-48cb-b7a7-0678edd720d9',
          },
          {
            name: 'Romanov',
            animalTypeId: '48ae8f1b-66d5-48cb-b7a7-0678edd720d9',
          },
          {
            name: 'Canard de Barbarie',
            animalTypeId: '338bfc76-5b9e-40cb-9780-b0c704b42fe4',
          },
          {
            name: 'Canard Fulvous Whistling Duck',
            animalTypeId: '338bfc76-5b9e-40cb-9780-b0c704b42fe4',
          },
          {
            name: 'Canard de Barbarie',
            animalTypeId: '338bfc76-5b9e-40cb-9780-b0c704b42fe4',
          },
          {
            name: 'Canard Fulvous Whistling Duck',
            animalTypeId: '338bfc76-5b9e-40cb-9780-b0c704b42fe4',
          },
          {
            name: 'Canard de Pékin',
            animalTypeId: '338bfc76-5b9e-40cb-9780-b0c704b42fe4',
          },
          {
            name: 'Canard Mulard',
            animalTypeId: '338bfc76-5b9e-40cb-9780-b0c704b42fe4',
          },
          {
            name: 'Canard Khaki Campbell',
            animalTypeId: '338bfc76-5b9e-40cb-9780-b0c704b42fe4',
          },
          {
            name: 'Canard de Rouen',
            animalTypeId: '338bfc76-5b9e-40cb-9780-b0c704b42fe4',
          },
          {
            name: 'Canard Coureur Indien',
            animalTypeId: '338bfc76-5b9e-40cb-9780-b0c704b42fe4',
          },
          {
            name: 'Canard africain',
            animalTypeId: '338bfc76-5b9e-40cb-9780-b0c704b42fe4',
          },
          {
            name: 'Dindon Bronzaillé',
            animalTypeId: 'c8cec2c4-c5e8-4e43-8e39-73aa6dff22df',
          },
          {
            name: 'Dindon Blanc de Hollande',
            animalTypeId: 'c8cec2c4-c5e8-4e43-8e39-73aa6dff22df',
          },
          {
            name: 'Dindon Royal Palm',
            animalTypeId: 'c8cec2c4-c5e8-4e43-8e39-73aa6dff22df',
          },
          {
            name: 'Dindon Bleu de Suède',
            animalTypeId: 'c8cec2c4-c5e8-4e43-8e39-73aa6dff22df',
          },
          {
            name: 'Dindon Bourbon Rouge',
            animalTypeId: 'c8cec2c4-c5e8-4e43-8e39-73aa6dff22df',
          },
          {
            name: 'Dindon Narragansett',
            animalTypeId: 'c8cec2c4-c5e8-4e43-8e39-73aa6dff22df',
          },
          {
            name: 'Dindon Noir de Sologne',
            animalTypeId: 'c8cec2c4-c5e8-4e43-8e39-73aa6dff22df',
          },
          {
            name: 'Dindon Broad Breasted White',
            animalTypeId: 'c8cec2c4-c5e8-4e43-8e39-73aa6dff22df',
          },
          {
            name: 'Dindon Midget White',
            animalTypeId: 'c8cec2c4-c5e8-4e43-8e39-73aa6dff22df',
          },
          {
            name: 'Dindon Blanc de Hollande',
            animalTypeId: 'c8cec2c4-c5e8-4e43-8e39-73aa6dff22df',
          },
          {
            name: 'Holstein-Frisonne',
            animalTypeId: '6f5cfbbf-8b02-4cb4-b1ed-4d08b4955832',
          },
          {
            name: 'Jersey',
            animalTypeId: '6f5cfbbf-8b02-4cb4-b1ed-4d08b4955832',
          },
          {
            name: 'Guernesey',
            animalTypeId: '6f5cfbbf-8b02-4cb4-b1ed-4d08b4955832',
          },
          {
            name: 'Montbéliarde',
            animalTypeId: '6f5cfbbf-8b02-4cb4-b1ed-4d08b4955832',
          },
          {
            name: 'Normande',
            animalTypeId: '6f5cfbbf-8b02-4cb4-b1ed-4d08b4955832',
          },
          {
            name: 'Ayrshire',
            animalTypeId: '6f5cfbbf-8b02-4cb4-b1ed-4d08b4955832',
          },
          {
            name: 'Brune des Alpes (Brown Swiss)',
            animalTypeId: '6f5cfbbf-8b02-4cb4-b1ed-4d08b4955832',
          },
          {
            name: 'Pie Rouge des Plaines',
            animalTypeId: '6f5cfbbf-8b02-4cb4-b1ed-4d08b4955832',
          },
          {
            name: 'Holstein-Frisonne',
            animalTypeId: '6f5cfbbf-8b02-4cb4-b1ed-4d08b4955832',
          },
          {
            name: 'Charolaise',
            animalTypeId: '6f5cfbbf-8b02-4cb4-b1ed-4d08b4955832',
          },
          {
            name: 'Limousine',
            animalTypeId: '6f5cfbbf-8b02-4cb4-b1ed-4d08b4955832',
          },
          {
            name: 'Angus',
            animalTypeId: '6f5cfbbf-8b02-4cb4-b1ed-4d08b4955832',
          },
          {
            name: 'Zébu Boran',
            animalTypeId: '6f5cfbbf-8b02-4cb4-b1ed-4d08b4955832',
          },
          {
            name: 'Zébu Sahiwal',
            animalTypeId: '6f5cfbbf-8b02-4cb4-b1ed-4d08b4955832',
          },
          {
            name: 'Zébu Brahman',
            animalTypeId: '6f5cfbbf-8b02-4cb4-b1ed-4d08b4955832',
          },
          {
            name: 'Hereford',
            animalTypeId: '6f5cfbbf-8b02-4cb4-b1ed-4d08b4955832',
          },
          {
            name: 'Blonde Aquitaine',
            animalTypeId: '6f5cfbbf-8b02-4cb4-b1ed-4d08b4955832',
          },
          {
            name: 'Salers',
            animalTypeId: '6f5cfbbf-8b02-4cb4-b1ed-4d08b4955832',
          },
          {
            name: 'Galloway',
            animalTypeId: '6f5cfbbf-8b02-4cb4-b1ed-4d08b4955832',
          },
          {
            name: 'Simmental',
            animalTypeId: '6f5cfbbf-8b02-4cb4-b1ed-4d08b4955832',
          },
          {
            name: 'Shorthorn',
            animalTypeId: '6f5cfbbf-8b02-4cb4-b1ed-4d08b4955832',
          },
          {
            name: 'Tilapia',
            animalTypeId: 'f167c551-cbfd-426c-8e20-dfd2bf17c9b3',
          },
          {
            name: 'Carpe commune',
            animalTypeId: 'f167c551-cbfd-426c-8e20-dfd2bf17c9b3',
          },
          {
            name: 'Poisson-chat (Siluriformes)',
            animalTypeId: 'f167c551-cbfd-426c-8e20-dfd2bf17c9b3',
          },
          {
            name: 'Silure (Clarias gariepinus)',
            animalTypeId: 'f167c551-cbfd-426c-8e20-dfd2bf17c9b3',
          },
          {
            name: 'Truite arc-en-ciel',
            animalTypeId: 'f167c551-cbfd-426c-8e20-dfd2bf17c9b3',
          },
          {
            name: 'Perche du Nil',
            animalTypeId: 'f167c551-cbfd-426c-8e20-dfd2bf17c9b3',
          },
          {
            name: 'Esturgeon',
            animalTypeId: 'f167c551-cbfd-426c-8e20-dfd2bf17c9b3',
          },
          {
            name: 'Bar ou Loup de mer ',
            animalTypeId: 'f167c551-cbfd-426c-8e20-dfd2bf17c9b3',
          },
          {
            name: 'Dorade royale (Sparus aurata)',
            animalTypeId: 'f167c551-cbfd-426c-8e20-dfd2bf17c9b3',
          },
          {
            name: 'Saumon Atlantique',
            animalTypeId: 'f167c551-cbfd-426c-8e20-dfd2bf17c9b3',
          },
          {
            name: 'Maquereau',
            animalTypeId: 'f167c551-cbfd-426c-8e20-dfd2bf17c9b3',
          },
          {
            name: 'Thon rouge ',
            animalTypeId: 'f167c551-cbfd-426c-8e20-dfd2bf17c9b3',
          },
          {
            name: 'Flétan',
            animalTypeId: 'f167c551-cbfd-426c-8e20-dfd2bf17c9b3',
          },
          {
            name: 'Turbot',
            animalTypeId: 'f167c551-cbfd-426c-8e20-dfd2bf17c9b3',
          },
          {
            name: 'Cobia',
            animalTypeId: 'f167c551-cbfd-426c-8e20-dfd2bf17c9b3',
          },
        ],
        skipDuplicates: true,
      });

      /** Seedind currencies */
      await prisma.currency.createMany({
        data: [
          { name: 'Algerian Dinar', code: 'DZD', symbol: 'د.ج' },
          { name: 'Angolan Kwanza', code: 'AOA', symbol: 'Kz' },
          { name: 'Botswana Pula', code: 'BWP', symbol: 'P' },
          { name: 'Burundian Franc', code: 'BIF', symbol: 'FBu' },
          { name: 'Cape Verdean Escudo', code: 'CVE', symbol: 'Esc' },
          { name: 'Central African CFA Franc', code: 'XAF', symbol: 'FCFA' },
          { name: 'Comorian Franc', code: 'KMF', symbol: 'CF' },
          { name: 'Congolese Franc', code: 'CDF', symbol: 'FC' },
          { name: 'Djiboutian Franc', code: 'DJF', symbol: 'Fdj' },
          { name: 'Egyptian Pound', code: 'IQD', symbol: 'E£' },
          { name: 'Eritrean Nakfa', code: 'ERN', symbol: 'Nfk' },
          { name: 'Ethiopian Birr', code: 'ETB', symbol: 'Br' },
          { name: 'Gambian Dalasi', code: 'GMD', symbol: 'D' },
          { name: 'Ghanaian Cedi', code: 'GHS', symbol: 'GH₵' },
          { name: 'Guinean Franc', code: 'GNF', symbol: 'FG' },
          { name: 'Kenyan Shilling', code: 'KES', symbol: 'KSh' },
          { name: 'Lesotho Loti', code: 'LSL', symbol: 'L' },
          { name: 'Liberian Dollar', code: 'LRD', symbol: 'L$' },
          { name: 'Libyan Dinar', code: 'LYD', symbol: 'LD' },
          { name: 'Malagasy Ariary', code: 'MGA', symbol: 'Ar' },
          { name: 'Malawian Kwacha', code: 'MWK', symbol: 'MK' },
          { name: 'Mauritanian Ouguiya', code: 'MRU', symbol: 'UM' },
          { name: 'Mauritian Rupee', code: 'MUR', symbol: 'Rs' },
          { name: 'Moroccan Dirham', code: 'MAD', symbol: 'د.م.' },
          { name: 'Mozambican Metical', code: 'MZN', symbol: 'MT' },
          { name: 'Namibian Dollar', code: 'NAD', symbol: 'N$' },
          { name: 'Nigerian Naira', code: 'NGN', symbol: '₦' },
          { name: 'Rwandan Franc', code: 'RWF', symbol: 'FRw' },
          { name: 'São Tomé and Príncipe Dobra', code: 'STN', symbol: 'Db' },
          { name: 'West African CFA Franc', code: 'XOF', symbol: 'CFA' },
          { name: 'Seychellois Rupee', code: 'SCR', symbol: 'Rs' },
          { name: 'Sierra Leonean Leone', code: 'SLL', symbol: 'Le' },
          { name: 'Somali Shilling', code: 'SOS', symbol: 'Sh' },
          { name: 'South African Rand', code: 'ZAR', symbol: 'R' },
          { name: 'South Sudanese Pound', code: 'SSP', symbol: 'SSP' },
          { name: 'Sudanese Pound', code: 'SDG', symbol: 'SDG' },
          { name: 'Swazi Lilangeni', code: 'SZL', symbol: 'E' },
          { name: 'Tanzanian Shilling', code: 'TZS', symbol: 'TSh' },
          { name: 'Tunisian Dinar', code: 'TND', symbol: 'د.ت' },
          { name: 'Ugandan Shilling', code: 'UGX', symbol: 'USh' },
          { name: 'Zambian Kwacha', code: 'ZMW', symbol: 'ZK' },
          { name: 'Zimbabwean Dollar', code: 'ZWL', symbol: 'Z$' },
          { name: 'United States Dollar', code: 'USD', symbol: '$' },
          { name: 'Euro', code: 'EUR', symbol: '€' },
          { name: 'Japanese Yen', code: 'JPY', symbol: '¥' },
          { name: 'British Pound Sterling', code: 'GBP', symbol: '£' },
          { name: 'Swiss Franc', code: 'CHF', symbol: 'CHF' },
          { name: 'Canadian Dollar', code: 'CAD', symbol: 'CA$' },
          { name: 'Australian Dollar', code: 'AUD', symbol: 'A$' },
          { name: 'Chinese Yuan (Renminbi)', code: 'CNY', symbol: '¥' },
          { name: 'Swedish Krona', code: 'SEK', symbol: 'kr' },
          { name: 'New Zealand Dollar', code: 'NZD', symbol: 'NZ$' },
          { name: 'South Korean Won', code: 'KRW', symbol: '₩' },
          { name: 'Singapore Dollar', code: 'SGD', symbol: 'S$' },
          { name: 'Hong Kong Dollar', code: 'HKD', symbol: 'HK$' },
          { name: 'Norwegian Krone', code: 'NOK', symbol: 'kr' },
          { name: 'Mexican Peso', code: 'MXN', symbol: 'Mex$' },
          { name: 'Indian Rupee', code: 'INR', symbol: '₹' },
          { name: 'Russian Ruble', code: 'RUB', symbol: '₽' },
          { name: 'Brazilian Real', code: 'BRL', symbol: 'R$' },
          { name: 'South African Rand', code: 'ZAR', symbol: 'R' },
          { name: 'Turkish Lira', code: 'TRY', symbol: '₺' },
          { name: 'UAE Dirham', code: 'AED', symbol: 'د.إ' },
          { name: 'Saudi Riyal', code: 'SAR', symbol: 'ر.س' },
          { name: 'Thai Baht', code: 'THB', symbol: '฿' },
          { name: 'Israeli New Shekel', code: 'ILS', symbol: '₪' },
          { name: 'Indonesian Rupiah', code: 'IDR', symbol: 'Rp' },
          { name: 'Malaysian Ringgit', code: 'MYR', symbol: 'RM' },
          { name: 'Philippine Peso', code: 'PHP', symbol: '₱' },
          { name: 'Pakistani Rupee', code: 'PKR', symbol: 'Rs' },
          { name: 'Argentine Peso', code: 'ARS', symbol: '$' },
          { name: 'Collombian Peso', code: 'COP', symbol: '$' },
          { name: 'Chilean Peso', code: 'CLP', symbol: '$' },
          { name: 'Ukrainian Hryvnia', code: 'UAH', symbol: '₴' },
          { name: 'Vietnamese Dong', code: 'VND', symbol: '₫' },
          { name: 'Bangladeshi Taka', code: 'BDT', symbol: '৳' },
          { name: 'Peruvian Sol', code: 'PEN', symbol: 'S/.' },
          { name: 'Kuwaiti Dinar', code: 'KWD', symbol: 'د.ك' },
          { name: 'Qatar Riyal', code: 'QAR', symbol: 'ر.ق' },
          { name: 'Omani Rial', code: 'OMR', symbol: 'ر.ع.' },
          { name: 'Jordanian Dinar', code: 'JOD', symbol: 'د.ا' },
          { name: 'Bahraini Dinar', code: 'BHD', symbol: 'د.ب' },
          { name: 'Icelandic Krona', code: 'ISK', symbol: 'kr' },
          { name: 'Iraqi Dinar', code: 'IQD', symbol: 'د.ع' },
          { name: 'Lebanese Pound', code: 'LBP', symbol: 'ل.ل' },
          { name: 'Sri Lankan Rupee', code: 'LKR', symbol: 'Rs' },
          { name: 'Georgian Lari', code: 'GEL', symbol: '₾' },
          { name: 'Costa Rican Colon', code: 'CRC', symbol: '₡' },
          { name: 'Croatian Kuna', code: 'HRK', symbol: 'kn' },
          { name: 'Bulgarian Lev', code: 'BGN', symbol: 'лв' },
          { name: 'Romanian Leu', code: 'RON', symbol: 'lei' },
          { name: 'Czech Koruna', code: 'CZK', symbol: 'Kč' },
          { name: 'Danish Krone', code: 'DKK', symbol: 'kr' },
          { name: 'Hungarian Forint', code: 'HUF', symbol: 'Ft' },
          { name: 'Polish Zloty', code: 'PLN', symbol: 'zł' },
        ],
        skipDuplicates: true,
      });

      /** Seeding animal types */
      await prisma.animalType.createMany({
        data: [
          {
            name: 'Poulet de chair',
            slug: 'poulets de chair',
            tab: 'aves-locations',
            habitat: 'poulaillé',
            photo:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/shutterstock_95209237-768x512.jpg20241024-C93N.jpeg',
            description:
              'Elever des poulets de chair  de zero jour à 31jours pour leur viande',
          },
          {
            name: 'Pondeuses',
            slug: 'pondeuses',
            tab: 'aves-locations',
            photo:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/laying-hens-4133954_640.jpg20241024-e0QI.jpeg',
            habitat: 'poulaillé',
            description:
              'Ici vous pouvez élever des poussins jusqua la phase de ponte pour les oeufs et puis les reformer pour la viande',
          },
          {
            name: 'Bovins',
            slug: 'boeufs',
            tab: 'locations',
            habitat: 'Etable',
            photo:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/cow-3383624_640.jpg20241024-tzfZ.jpeg',
            description:
              'Une section pour élever des boeufs pour la production laitière et leur viande',
          },
          {
            name: 'Ovins',
            slug: 'moutons',
            habitat: 'enclos',
            tab: 'locations',
            photo:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/sheeps-6828766_640.jpg20241024-bfX0.jpeg',
            description: 'Elever des moutons pour leur viande ou leur laine',
          },
          {
            name: 'Caprins',
            slug: 'chèvres',
            habitat: 'enclos',
            tab: 'locations',
            photo:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/csm_ziegen_prospecierara_0f7b1f0deb.jpg20241024-96ny.jpeg',
            description: 'Elever des chèvres pour leurs viande ou du lait',
          },
          {
            name: 'Porciculture',
            slug: 'porcs',
            tab: 'locations',
            habitat: 'loge',
            photo:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/breeding-3739223_640.jpg20241024-3lEB.jpeg',
            description:
              'Elever des porcs pour leur viande qui passe bien sur le marché sans hésiter de varier les races pour maximer votre profit',
          },
          {
            name: 'Cuniculture',
            slug: 'lapins',
            tab: 'locations',
            habitat: 'clapier',
            photo:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/rabbits-6889130_640.jpg20241024-0Qme.jpeg',
            description:
              'Elever des lapins pour leur prolificité, leur viande succulente faible en matière grasse et très bonne pour la santé',
          },
          {
            name: 'Quails',
            slug: 'quails',
            habitat: 'cage',
            tab: 'aves-locations',
            photo:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/pexels-brett-sayles-1309236.jpg20241024-jMYC.jpeg',
            description:
              'Elever des quails pour les viande et leur oeufs faible en matière grasse et verture médicinale',
          },
          {
            name: 'Canard',
            slug: 'canards',
            tab: 'aves-locations',
            habitat: 'canardière',
            photo:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/pekin_ducks_cropped.jpg20241024-3Ui6.jpeg',
            description:
              'Elever des canards pour leur rusticité, la vente de leur bonne viande blanche très faible en matière grasse et riche en proteins, leur oeufs fécondés et leur cannetons',
          },
          {
            name: 'Pisciculture',
            slug: 'poissons',
            habitat: 'étang',
            tab: 'aves-locations',
            photo:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/trout-4725772_640.jpg20241024-fRB1.jpeg',
            description:
              'Elever des poissons pour la consomation domestique ou la vente',
          },
          {
            name: 'Dinde',
            slug: 'dindons',
            tab: 'aves-locations',
            habitat: 'poulaillé',
            photo:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/turkey-3455659_640.jpg20241024-sm7X.jpeg',
            description:
              'Elever des dindons pour leur gabarit, la vente de leur bonne viande blanche très faible en matière grasse et riche en proteins, leur oeufs fécondés et leur poussins',
          },
          {
            name: 'Pintarde',
            slug: 'pintardes',
            tab: 'aves-locations',
            habitat: 'poullaillé',
            photo:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/birds-7045998_640.jpg20241024-EeKf.jpeg',
            description:
              'Elever des pintarde pour leur rusticité et la vente de leur bonne viande blanche très faible en matière grasse, riche en proteins',
          },
          {
            name: 'Poulets Brahma',
            slug: 'poulets brahma',
            tab: 'aves-locations',
            habitat: 'poullaillé',
            photo:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/hen-brahma-4046755_640.jpg20241024-pc09.jpeg',
            description:
              'Elever des poulets brahmas pour leur rusticité, la vente de leur bonne viande blanche très faible en matière grasse et riche en proteins, leur oeufs fécondés et leur poussins',
          },
          {
            name: 'Poulets Goliaths',
            slug: 'poulets goliath',
            habitat: 'poullaillé',
            tab: 'aves-locations',
            photo:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/1599px-des_poulets_goliath_de_couleur_beige_dans_un_poulailler_au_benin.jpg20241024-Zlci.jpeg',
            description:
              'Elever des pintarde pour leur rusticité et la vente de leur bonne viande blanche très faible en matière grasse, riche en proteins',
          },
        ],
        skipDuplicates: true,
      });

      console.log(`${environment} database seeded successfully`);
      break;
    case 'test':
      /** data for your test environment */
      break;
    default:
      break;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
