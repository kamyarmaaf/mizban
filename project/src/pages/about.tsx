import { Map, Users, Heart, Camera, Shield, Globe } from 'lucide-react';
import artImg from '../assets/images/miz.webp';
import Footer from '../components/Footer';

export default function AboutPage() {
  const values = [
    {
      icon: <Map className="w-8 h-8 text-primary" />,
      title: 'تجربه‌های اصیل',
      description: 'ما شما را از مسیرهای تکراری توریستی خارج می‌کنیم تا قلب تپنده هر شهر را از نزدیک لمس کنید.'
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: 'ارتباطات انسانی',
      description: 'سفر برای ما یعنی آشنایی با آدم‌های جدید. میزبان‌ها صرفاً راهنما نیستند، دوستان جدید شما در شهرهای مختلفند.'
    },
    {
      icon: <Camera className="w-8 h-8 text-primary" />,
      title: 'روایت داستان‌ها',
      description: 'هر سفر یک قصه است. در بخش بلاگ میزبان، فضایی خلق کرده‌ایم تا مسافران خاطرات و تجربیاتشان را جاودانه کنند.'
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: 'اعتماد و احترام',
      description: 'جامعه کاربری ما بر پایه احترام متقابل و کامنت‌های سازنده شکل گرفته است تا فضایی امن برای همه فراهم شود.'
    }
  ];

  return (
    <div className="min-h-screen bg-light pb-20">
      {/* Hero Section */}
      <div className="relative bg-primary py-24 overflow-hidden">

        <div className="absolute inset-0 bg-dark/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-light mb-6 animate-fade-in">
            داستانِ میزبان
          </h1>
          <p className="text-xl md:text-2xl text-light/90 max-w-3xl mx-auto leading-relaxed">
            سفر فقط رسیدن به مقصد نیست؛ کشف آدم‌ها، طعم‌ها و داستان‌های جدید است.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-right">

        {/* Mission Section */}
        <div className="bg-white rounded-3xl shadow-luxury p-8 md:p-12 mb-16">
          <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
            <div className="w-full md:w-1/2">
              <img
                src={artImg}
                alt="افراد در حال معاشرت"
                className="rounded-2xl shadow-lg w-full object-cover h-80"
              />
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl font-black text-dark mb-6 flex items-center gap-3">
                <Globe className="w-8 h-8 text-primary" />
                ما کی هستیم؟
              </h2>
              <p className="text-dark/80 text-lg leading-relaxed mb-4">
                ایده «میزبان» از یک نیاز ساده شکل گرفت: فرار از سفرهای کلیشه‌ای. ما باور داریم که بهترین راه برای شناخت یک فرهنگ، نشستن پای صحبت محلی‌ها و تجربه زندگی به سبک آن‌هاست.
              </p>
              <p className="text-dark/80 text-lg leading-relaxed">
                در میزبان، مسافران فقط یک اتاق رزرو نمی‌کنند، بلکه یک «تجربه» را زندگی می‌کنند. چه یادگیری پخت یک غذای محلی باشد، چه قدم زدن در کوچه‌پس‌کوچه‌هایی که در هیچ نقشه توریستی نیست. ما اینجا هستیم تا فاصله بین مسافر و جامعه محلی را از بین ببریم.
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-black text-center text-dark mb-10">
            ارزش‌های ما در میزبان
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-luxury transition-all duration-300 hover:-translate-y-2 border border-gray-100 text-center"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {value.icon}
                </div>
                <h4 className="text-xl font-bold text-dark mb-3">{value.title}</h4>
                <p className="text-dark/70 leading-relaxed text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-dark rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10">
            <Heart className="w-16 h-16 text-complementary mx-auto mb-6" />
            <h2 className="text-3xl font-black text-light mb-6">
              بخشی از جامعه میزبان باشید
            </h2>
            <p className="text-light/80 text-lg mb-8 max-w-2xl mx-auto">
              داستان سفر بعدی شما از اینجا شروع می‌شود. به جمع مسافران و میزبانان ما بپیوندید، تجربه‌های خود را به اشتراک بگذارید و دنیا را از زاویه‌ای جدید کشف کنید.
            </p>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
