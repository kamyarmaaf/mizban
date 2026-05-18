import { Home, Search, Calendar, Heart, User } from "lucide-react";

interface MobileBottomNavProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function MobileBottomNav({ activePage, onNavigate }: MobileBottomNavProps) {
  // آیتم‌های منوی پایین بر اساس عکس شما
  const navItems = [
    { id: "home", label: "خانه", icon: Home },
    { id: "search", label: "جستجو", icon: Search },
    { id: "bookings", label: "برنامه‌ها", icon: Calendar },
    { id: "favorites", label: "علاقه‌مندی‌ها", icon: Heart },
    { id: "profile", label: "پروفایل", icon: User },
  ];

  return (
    {/* md:hidden باعث می‌شود در دسکتاپ مخفی شود */}
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-dark/5 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50 px-4 py-2 pb-safe">
      <div className="flex justify-between items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center w-14 gap-1 transition-all duration-300 ${
                isActive ? "text-primary scale-105" : "text-dark/40 hover:text-dark/60"
              }`}
            >
              {/* بک‌گراند آیکون در حالت فعال */}
              <div className={`p-2.5 rounded-2xl transition-all duration-300 ${
                isActive ? "bg-primary/10" : "bg-transparent"
              }`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold ${
                isActive ? "text-primary" : "text-transparent h-0 overflow-hidden"
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
