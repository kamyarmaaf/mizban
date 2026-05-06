import { Experience, Booking, Comment } from './types';

export const mockExperiences: Experience[] = [
  {
    id: '1',
    title: 'تور غذاهای محلی شیراز',
    description: 'تجربه‌ای فراموش‌نشدنی از طعم‌های اصیل شیرازی. از کله پاچه صبحگاهی تا فالوده شبانه.',
    price: 450000,
    city: 'شیراز',
    region: 'مرکز شهر',
    category: 'غذا و نوشیدنی',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    providerName: 'علی محمدی',
    rating: 4.8,
    totalRatings: 127,
    createdAt: new Date('2024-08-15'),
    date: '۱۴۰۳/۱۱/۲۵',
    time: '۱۰:۰۰',
    duration: '۴ ساعت'
  },
  {
    id: '2',
    title: 'پیاده‌روی در طبیعت دربند',
    description: 'یک روز دلنشین در کوهستان‌های شمال تهران با راهنمای حرفه‌ای.',
    price: 280000,
    city: 'تهران',
    region: 'دربند',
    category: 'طبیعت و کوهنوردی',
    image: 'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800',
    providerName: 'سارا احمدی',
    rating: 4.9,
    totalRatings: 215,
    createdAt: new Date('2024-09-02'),
    date: '۱۴۰۳/۱۱/۲۸',
    time: '۰۷:۳۰',
    duration: '۶ ساعت'
  },
  {
    id: '3',
    title: 'بازدید از باغ‌های تاریخی کاشان',
    description: 'سفری به دوران قاجار در باغ فین و خانه‌های تاریخی کاشان.',
    price: 350000,
    city: 'کاشان',
    region: 'مرکز تاریخی',
    category: 'گردشگری فرهنگی',
    image: 'https://images.pexels.com/photos/2739664/pexels-photo-2739664.jpeg?auto=compress&cs=tinysrgb&w=800',
    providerName: 'رضا کریمی',
    rating: 4.7,
    totalRatings: 98,
    createdAt: new Date('2024-07-20'),
    date: '۱۴۰۳/۱۲/۰۲',
    time: '۰۹:۰۰',
    duration: '۳ ساعت'
  },
  {
    id: '4',
    title: 'کلاس آشپزی سنتی اصفهان',
    description: 'یاد بگیرید بریانی و گز اصفهانی را مثل استادها درست کنید.',
    price: 520000,
    city: 'اصفهان',
    region: 'نقش جهان',
    category: 'غذا و نوشیدنی',
    image: 'https://images.pexels.com/photos/4253320/pexels-photo-4253320.jpeg?auto=compress&cs=tinysrgb&w=800',
    providerName: 'فاطمه نوری',
    rating: 5.0,
    totalRatings: 156,
    createdAt: new Date('2024-09-10'),
    date: '۱۴۰۳/۱۱/۳۰',
    time: '۱۵:۰۰',
    duration: '۳ ساعت'
  },
  {
    id: '5',
    title: 'تور عکاسی غروب خلیج فارس',
    description: 'ثبت لحظات جادویی غروب در جزایر زیبای خلیج فارس.',
    price: 680000,
    city: 'قشم',
    region: 'ساحل',
    category: 'عکاسی و هنر',
    image: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=800',
    providerName: 'حسین رضایی',
    rating: 4.6,
    totalRatings: 83,
    createdAt: new Date('2024-08-25'),
    date: '۱۴۰۳/۱۲/۰۵',
    time: '۱۷:۳۰',
    duration: '۲ ساعت'
  },
  {
    id: '6',
    title: 'جشن محلی در روستای ماسوله',
    description: 'شرکت در جشن محلی و آشنایی با فرهنگ اصیل گیلانی.',
    price: 380000,
    city: 'رشت',
    region: 'ماسوله',
    category: 'گردشگری فرهنگی',
    image: 'https://images.pexels.com/photos/2034851/pexels-photo-2034851.jpeg?auto=compress&cs=tinysrgb&w=800',
    providerName: 'مریم اسدی',
    rating: 4.9,
    totalRatings: 142,
    createdAt: new Date('2024-08-30'),
    date: '۱۴۰۳/۱۲/۰۸',
    time: '۱۴:۰۰',
    duration: '۵ ساعت'
  },
  {
    id: '7',
    title: 'تجربه کویر یزد با شب‌نشینی',
    description: 'یک شب رویایی در دل کویر با آسمان پر ستاره و آتش سنتی.',
    price: 750000,
    city: 'یزد',
    region: 'کویر میبد',
    category: 'ماجراجویی',
    image: 'https://images.pexels.com/photos/714258/pexels-photo-714258.jpeg?auto=compress&cs=tinysrgb&w=800',
    providerName: 'امیر حسینی',
    rating: 4.8,
    totalRatings: 94,
    createdAt: new Date('2024-08-12'),
    date: '۱۴۰۳/۱۲/۱۰',
    time: '۱۸:۰۰',
    duration: '۱۲ ساعت'
  },
  {
    id: '8',
    title: 'کارگاه سفالگری در لاله‌جین',
    description: 'خلق یک اثر هنری منحصربه‌فرد با دستان خودتان.',
    price: 420000,
    city: 'همدان',
    region: 'لاله‌جین',
    category: 'عکاسی و هنر',
    image: 'https://images.pexels.com/photos/6544376/pexels-photo-6544376.jpeg?auto=compress&cs=tinysrgb&w=800',
    providerName: 'زهرا محمدپور',
    rating: 4.7,
    totalRatings: 67,
    createdAt: new Date('2024-08-18'),
    date: '۱۴۰۳/۱۱/۲۷',
    time: '۱۱:۰۰',
    duration: '۲.۵ ساعت'
  },
  {
    id: '9',
    title: 'تور میراث فرهنگی کرمان',
    description: 'بازدید از قلعه‌ها و آثار تاریخی کرمان با راهنمای متخصص.',
    price: 380000,
    city: 'کرمان',
    region: 'مرکز تاریخی',
    category: 'گردشگری فرهنگی',
    image: 'https://images.pexels.com/photos/2739664/pexels-photo-2739664.jpeg?auto=compress&cs=tinysrgb&w=800',
    providerName: 'محمد کرمانی',
    rating: 4.5,
    totalRatings: 72,
    createdAt: new Date('2024-07-10'),
    date: '۱۴۰۳/۱۲/۰۳',
    time: '۰۸:۳۰',
    duration: '۴ ساعت'
  },
  {
    id: '10',
    title: 'کاوش در بافت‌های قدیم کرمان',
    description: 'پیاده‌روی در خیابان‌های تاریخی و بازارهای تقلیدی کرمان.',
    price: 320000,
    city: 'کرمان',
    region: 'بازار',
    category: 'گردشگری فرهنگی',
    image: 'https://images.pexels.com/photos/3808521/pexels-photo-3808521.jpeg?auto=compress&cs=tinysrgb&w=800',
    providerName: 'فاطمه کریمی',
    rating: 4.6,
    totalRatings: 54,
    createdAt: new Date('2024-08-05'),
    date: '۱۴۰۳/۱۲/۰۶',
    time: '۰۹:۳۰',
    duration: '۳ ساعت'
  },
  {
    id: '11',
    title: 'تجربه غذاهای محلی کرمان',
    description: 'خوردن غذاهای خوشمزه محلی کرمان و یادگیری تاریخچه‌ی هر غذا.',
    price: 290000,
    city: 'کرمان',
    region: 'مرکز شهر',
    category: 'غذا و نوشیدنی',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    providerName: 'علی محمدی',
    rating: 4.8,
    totalRatings: 119,
    createdAt: new Date('2024-09-01'),
    date: '۱۴۰۳/۱۲/۰۱',
    time: '۱۲:۰۰',
    duration: '۳.۵ ساعت'
  },
  {
    id: '12',
    title: 'کارگاه فرش بافی کرمان',
    description: 'یادگیری هنر باستانی فرش بافی کرمان از دست‌اندرکاران ماهر.',
    price: 450000,
    city: 'کرمان',
    region: 'کارگاه',
    category: 'عکاسی و هنر',
    image: 'https://images.pexels.com/photos/6544376/pexels-photo-6544376.jpeg?auto=compress&cs=tinysrgb&w=800',
    providerName: 'زهرا رحیمی',
    rating: 4.9,
    totalRatings: 88,
    createdAt: new Date('2024-09-03'),
    date: '۱۴۰۳/۱۱/۲۶',
    time: '۱۴:۳۰',
    duration: '۴ ساعت'
  },
  {
    id: '13',
    title: 'سفر به جزیره کیش و غوطه‌وری',
    description: 'یک تجربه فراموش‌نشدنی در جزیره بهشتی کیش. روزی پر از غوطه‌وری در آب‌های صاف و دیدن زیستان دریایی رنگین‌رنگ. ساحل شن‌های سفید، تفریحات دریایی متنوع و غذاهای تازه دریایی. مردم بسیار مهربان و حاضر به کمک بودند. هتل خوب و قرارداد معقول داشت. حتماً سفر دوباره‌ای برای من است.',
    price: 850000,
    city: 'قشم',
    region: 'ساحل',
    category: 'ماجراجویی',
    image: 'https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&w=800',
    providerName: 'علی حسینی (کاربر)',
    rating: 5.0,
    totalRatings: 23,
    createdAt: new Date('2024-09-25'),
    date: '۱۴۰۳/۱۲/۱۵',
    time: '۰۷:۰۰',
    duration: '۲ روز'
  }
];

export const cities = [
  'تهران',
  'شیراز',
  'اصفهان',
  'کاشان',
  'یزد',
  'قشم',
  'رشت',
  'همدان',
  'کرمان',
  'جیرفت',
  'رفسنجان',
  'بافت',
  'کهنوج',
  'منوجان',
  'بم',
  'ریگان',
  'رودبار',
  'سیرجان'
];

export const categories = [
  'همه دسته‌ها',
  'غذا و نوشیدنی',
  'طبیعت و کوهنوردی',
  'گردشگری فرهنگی',
  'ماجراجویی',
  'عکاسی و هنر'
];

export const mockTouristBookings: Booking[] = [
  {
    id: 'b1',
    experienceTitle: 'تور غذاهای محلی شیراز',
    experienceImage: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    date: '۱۴۰۳/۱۱/۲۰',
    status: 'confirmed',
    price: 450000
  },
  {
    id: 'b2',
    experienceTitle: 'تجربه کویر یزد با شب‌نشینی',
    experienceImage: 'https://images.pexels.com/photos/714258/pexels-photo-714258.jpeg?auto=compress&cs=tinysrgb&w=400',
    date: '۱۴۰۳/۱۲/۰۵',
    status: 'pending',
    price: 750000
  },
  {
    id: 'b3',
    experienceTitle: 'پیاده‌روی در طبیعت دربند',
    experienceImage: 'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=400',
    date: '۱۴۰۳/۱۰/۱۵',
    status: 'completed',
    price: 280000
  }
];

export const mockProviderBookings: Booking[] = [
  {
    id: 'pb1',
    experienceTitle: 'کلاس آشپزی سنتی اصفهان',
    experienceImage: 'https://images.pexels.com/photos/4253320/pexels-photo-4253320.jpeg?auto=compress&cs=tinysrgb&w=400',
    date: '۱۴۰۳/۱۱/۲۵',
    status: 'confirmed',
    price: 520000,
    guestName: 'محمد رضایی'
  },
  {
    id: 'pb2',
    experienceTitle: 'کلاس آشپزی سنتی اصفهان',
    experienceImage: 'https://images.pexels.com/photos/4253320/pexels-photo-4253320.jpeg?auto=compress&cs=tinysrgb&w=400',
    date: '۱۴۰۳/۱۲/۰۱',
    status: 'pending',
    price: 520000,
    guestName: 'سارا احمدی'
  },
  {
    id: 'pb3',
    experienceTitle: 'کلاس آشپزی سنتی اصفهان',
    experienceImage: 'https://images.pexels.com/photos/4253320/pexels-photo-4253320.jpeg?auto=compress&cs=tinysrgb&w=400',
    date: '۱۴۰۳/۱۰/۲۰',
    status: 'completed',
    price: 520000,
    guestName: 'علی کریمی'
  }
];

export const mockComments: Comment[] = [
  {
    id: 'c1',
    experienceId: '1',
    userId: 'user1',
    userName: 'محمد رضایی',
    comment: 'تجربه فوق‌العاده‌ای بود! غذاهای محلی بسیار خوشمزه بودند و میزبان بسیار مهربان و دانا بود.',
    createdAt: new Date('2024-09-20')
  },
  {
    id: 'c2',
    experienceId: '1',
    userId: 'user2',
    userName: 'سارا احمدی',
    comment: 'واقعاً لذت بردم. همه چیز عالی بود و حتماً دوباره شرکت می‌کنم.',
    createdAt: new Date('2024-09-18')
  },
  {
    id: 'c3',
    experienceId: '2',
    userId: 'user3',
    userName: 'علی کریمی',
    comment: 'طبیعت دربند بی‌نظیر بود. راهنما خیلی باتجربه و دوستانه بود.',
    createdAt: new Date('2024-09-15')
  },
  {
    id: 'c4',
    experienceId: '4',
    userId: 'user4',
    userName: 'فاطمه حسینی',
    comment: 'کلاس آشپزی عالی بود! یاد گرفتم بریانی اصفهانی درست کنم. ممنون از میزبان عزیز.',
    createdAt: new Date('2024-09-12')
  },
  {
    id: 'c5',
    experienceId: '4',
    userId: 'user5',
    userName: 'حسین نوری',
    comment: 'تجربه‌ای آموزنده و خوشمزه. به همه توصیه می‌کنم.',
    createdAt: new Date('2024-09-10')
  }
];

export const provinces = [
  "آذربایجان شرقی",
  "آذربایجان غربی",
  "اردبیل",
  "اصفهان",
  "البرز",
  "ایلام",
  "بوشهر",
  "تهران",
  "چهارمحال و بختیاری",
  "خراسان جنوبی",
  "خراسان رضوی",
  "خراسان شمالی",
  "خوزستان",
  "زنجان",
  "سمنان",
  "سیستان و بلوچستان",
  "فارس",
  "قزوین",
  "قم",
  "کردستان",
  "کرمان",
  "کرمانشاه",
  "کهگیلویه و بویراحمد",
  "گلستان",
  "گیلان",
  "لرستان",
  "مازندران",
  "مرکزی",
  "هرمزگان",
  "همدان",
  "یزد"
]
