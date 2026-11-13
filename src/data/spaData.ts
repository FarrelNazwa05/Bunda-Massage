import { ServiceItem, PricingRow } from '../types';

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'tradisional',
    number: '01',
    title: 'Pijat Tradisional',
    description: 'Tekanan telapak dan ibu jari dengan minyak rempah hangat untuk membantu tubuh kembali ringan.',
    durationLabel: '60 / 90 MENIT',
    durations: [
      { minutes: 60, price: 150000 },
      { minutes: 90, price: 225000 },
    ],
    isFavorite: true,
    benefits: [
      'Meredakan ketegangan otot punggung & pundak',
      'Melancarkan sirkulasi darah dengan minyak rempah',
      'Mengurangi rasa pegal kronis setelah aktivitas berat',
    ],
    recommendedFor: 'Cocok untuk Anda yang sering duduk lama di depan komputer, berkendara jauh, atau beraktivitas fisik padat.',
    oilType: 'Minyak kelapa murni (VCO) diracik dengan jahe merah, sereh wangi, dan cengkeh Bali.',
  },
  {
    id: 'lulur',
    number: '02',
    title: 'Pijat + Lulur',
    description: 'Kombinasi pijat tradisional dengan baluran lulur rempah alami untuk mengangkat sel kulit mati dan menghaluskan tubuh.',
    durationLabel: '120 MENIT',
    durations: [
      { minutes: 120, price: 300000 },
    ],
    benefits: [
      'Mengangkat sel kulit mati dan mencerahkan kulit kusam',
      'Memadukan relaksasi otot mendalam dengan eksfoliasi rempah Bali',
      'Kulit terasa lebih lembut, halus, harum, dan segar bercahaya',
    ],
    recommendedFor: 'Bagi Anda yang ingin relaksasi tubuh menyeluruh selama 120 menit sekaligus merawat kehalusan kulit.',
    oilType: 'Minyak kelapa murni & lulur rempah tradisional Bali (kunyit, beras kencur, dan bengkoang alami).',
  },
  {
    id: 'refleksi',
    number: '03',
    title: 'Pijat Refleksi',
    description: 'Fokus pada titik-titik telapak kaki untuk membantu mengurangi rasa lelah setelah beraktivitas.',
    durationLabel: '30 MENIT',
    durations: [
      { minutes: 30, price: 75000 },
    ],
    benefits: [
      'Menstimulasi organ vital melalui titik zona refleksi telapak kaki',
      'Meredakan rasa kaku, keram, dan pegal pada telapak serta betis',
      'Mengembalikan energi segar tanpa perlu membuka seluruh pakaian',
    ],
    recommendedFor: 'Sangat pas setelah banyak berjalan, berlibur keliling Bali, atau setelah berdiri berjam-jam.',
    oilType: 'Minyak herbal eucalyptus & peppermint untuk sensasi segar sejuk meresap.',
  },
  {
    id: 'ibu-hamil',
    number: '04',
    title: 'Pijat Pasca Melahirkan',
    description: 'Perawatan lembut untuk membantu pemulihan tubuh ibu setelah persalinan, disesuaikan dengan kondisi setiap ibu.',
    durationLabel: '60 MENIT',
    durations: [
      { minutes: 60, price: 150000 },
    ],
    benefits: [
      'Membantu melancarkan peredaran darah dan pemulihan otot pasca persalinan',
      'Mengurangi pegal di area pinggang, punggung, serta rasa lelah',
      'Ditangani terapis perempuan berpengalaman dengan sentuhan lembut',
    ],
    recommendedFor: 'Ibu dalam masa nifas atau pemulihan pasca melahirkan untuk mengembalikan kebugaran dan ketenangan.',
    oilType: 'Virgin Coconut Oil murni tanpa wewangian sintetis, hipoalergenik dan nyaman untuk ibu.',
  },
];

export const PRICING_TABLE: PricingRow[] = [
  {
    treatment: 'Pijat Tradisional',
    duration: '60 menit',
    price: 150000,
    highlight: true,
  },
  {
    treatment: 'Pijat Tradisional',
    duration: '90 menit',
    price: 225000,
  },
  {
    treatment: 'Pijat + Lulur',
    duration: '120 menit',
    price: 300000,
  },
  {
    treatment: 'Pijat Refleksi',
    duration: '30 menit',
    price: 75000,
  },
  {
    treatment: 'Pijat Pasca Melahirkan',
    duration: '60 menit',
    price: 150000,
  },
];

export const BRANCH_INFO = {
  primary: {
    name: 'BUNDA Traditional Massage',
    address: 'Jalan Tibung Sari No. 51B, Banjar Kwanji',
    subdistrict: 'Desa Dalung, Kec. Kuta Utara',
    city: 'Kabupaten Badung, Bali',
    fullAddress:
      'Jalan Tibung Sari No. 51B, Banjar Kwanji, Desa Dalung, Kec. Kuta Utara, Kabupaten Badung, Bali',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Jalan+Tibung+Sari+No.+51B,+Banjar+Kwanji,+Desa+Dalung,+Kec.+Kuta+Utara,+Kabupaten+Badung,+Bali',
    hours: 'Sesuai jadwal di Google Maps',
  },
  whatsapp: '6283849643312',
  whatsappDisplay: '+62 838-4964-3312',
  instagram: '@bundatraditionalmassage',
};

