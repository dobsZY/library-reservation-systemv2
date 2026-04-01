import { NavLink } from 'react-router-dom';
import { Library, LayoutGrid, CalendarDays, User, Shield, Users, BookOpen, BarChart3 } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';

const studentLinks = [
  { to: '/', label: 'Salonlar', icon: Library },
  { to: '/halls', label: 'Kroki', icon: LayoutGrid },
  { to: '/reservations', label: 'Rezervasyonlarım', icon: CalendarDays },
  { to: '/profile', label: 'Hesabım', icon: User },
];

const adminLinks = [
  { to: '/admin', label: 'Panel', icon: BarChart3 },
  { to: '/admin/users', label: 'Kullanıcılar', icon: Users },
  { to: '/admin/reservations', label: 'Rezervasyonlar', icon: BookOpen },
];

export default function Sidebar() {
  const { user, isAdmin } = useAuthStore();
  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 flex flex-col z-40">
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Library className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">Selçuk Kütüphane</h1>
            <p className="text-xs text-gray-500">{isAdmin ? 'Yönetici Paneli' : 'Öğrenci Portalı'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/' || link.to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? isAdmin
                    ? 'bg-red-50 text-red-600'
                    : 'bg-amber-50 text-amber-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <link.icon className="w-5 h-5" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isAdmin ? 'bg-red-100' : 'bg-gray-100'}`}>
              {isAdmin ? (
                <Shield className="w-4 h-4 text-red-600" />
              ) : (
                <User className="w-4 h-4 text-gray-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
              <p className="text-xs text-gray-500 truncate">{user.studentNumber}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
