// Shared constants used by all CreateFarmPage steps
export const FARM_TYPES = [
  {
    id: 'CROP',
    title: 'Crops & Fields',
    desc: 'Cereals, vegetables, tubers, legumes, and field plantations',
  },
  {
    id: 'LIVESTOCK',
    title: 'Livestock & Animals',
    desc: 'Cattle, poultry, goats, sheep, pigs, and animal herds',
  },
  {
    id: 'MIXED',
    title: 'Mixed Agriculture',
    desc: 'Both crops and livestock raised together on the same land',
  },
];

export const SOIL_OPTIONS = [
  { id: 'LOAMY',  title: 'Loamy Soil',       desc: 'Balanced, dark & highly fertile' },
  { id: 'CLAY',   title: 'Clay Soil',         desc: 'Heavy soil, retains moisture well' },
  { id: 'SANDY',  title: 'Sandy Soil',        desc: 'Light & drains water very quickly' },
  { id: 'SILTY',  title: 'Silty Soil',        desc: 'Fine particles, fertile river land' },
  { id: 'PEATY',  title: 'Peaty Soil',        desc: 'High organic matter & damp' },
  { id: 'CHALKY', title: 'Chalky Soil',       desc: 'Stony, alkaline lime-rich soil' },
  { id: 'ROCKY',  title: 'Rocky / Mountain',  desc: 'Stony ground with shallow topsoil' },
];

export const SLOPE_OPTIONS = [
  { id: 'FLAT',     title: 'Flat Land',      desc: 'Level fields, easy mechanization' },
  { id: 'MODERATE', title: 'Gentle Slope',   desc: 'Slight incline, natural drainage' },
  { id: 'STEEP',    title: 'Steep Hillside', desc: 'High gradient or terraced slopes' },
];

export const POPULAR_COUNTRIES = ['Cameroon', 'Nigeria', 'Chad', 'Gabon', 'Congo'];

export const POPULAR_REGIONS = {
  Cameroon: [
    'Ouest (Bafoussam/Bandjoun)',
    'Littoral (Douala/Bassa)',
    'Centre (Yaoundé/Beti)',
    'Nord-Ouest (Bamenda)',
    'Sud-Ouest (Buea)',
    'Adamaoua (Ngaoundéré)',
  ],
  Nigeria: ['Oyo', 'Ogun', 'Kaduna', 'Kano', 'Plateau', 'Benue'],
};

