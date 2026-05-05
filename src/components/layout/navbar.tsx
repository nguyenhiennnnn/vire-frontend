import { Link, useNavigate, useLocation } from "react-router-dom";
import { Bell, Home, UserPlus, Search, X } from "lucide-react";
import { useNotificationStore } from "../../stores/notification-store";
import { useAuth } from "../../hooks/use-auth";
import { UserAvatar } from "../shared/user-avatar";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useDebounce } from "../../hooks/use-debounce";
import { usersApi } from "../../services/api-services";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useCallback } from "react";
import { cn } from "../../lib/utils";
import { Logo } from "../shared/logo";
import { NotificationDropdown } from "../notification/notification-dropdown";
import { ModeToggle } from "../mode-toggle";

function NavBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <Badge
      variant="destructive"
      className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center"
    >
      {count > 9 ? "9+" : count}
    </Badge>
  );
}

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount, friendRequestCount } = useNotificationStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(searchQuery, 300);

  const { data: searchResults = [], isFetching } = useQuery({
    queryKey: ["user-search", debouncedQuery],
    queryFn: () => usersApi.search(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 1000 * 30,
  });

  const showDropdown = isFocused && debouncedQuery.trim().length > 0;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  const handleSelectUser = useCallback(
    (userId: string) => {
      navigate(`/profile/${userId}`);
      setSearchQuery("");
      setIsFocused(false);
      inputRef.current?.blur();
    },
    [navigate],
  );

  const handleClear = () => {
    setSearchQuery("");
    inputRef.current?.focus();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-background/95 backdrop-blur-sm border-b flex items-center justify-center px-4 gap-3">
      <div className="flex-1 mx-auto max-w-7xl flex items-center justify-between">
        <Logo />

        <div className="flex-1 max-w-xs relative" ref={containerRef}>
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              ref={inputRef}
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setTimeout(() => setIsFocused(false), 150);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setSearchQuery("");
                  setIsFocused(false);
                  inputRef.current?.blur();
                }
              }}
              className="w-full h-9 pl-9 pr-8 rounded-full bg-muted border-0 text-sm outline-none focus:ring-1 focus:ring-primary transition-shadow placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleClear}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {showDropdown && (
            <div className="absolute top-full mt-1.5 left-0 w-80 bg-popover border rounded-xl shadow-md overflow-hidden z-50">
              {isFetching && searchResults.length === 0 ? (
                <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
                  Đang tìm kiếm...
                </div>
              ) : searchResults.length === 0 ? (
                <p className="text-sm text-muted-foreground p-3">
                  Không tìm thấy kết quả
                </p>
              ) : (
                <div className="p-1">
                  {searchResults.map((u) => (
                    <button
                      key={u.id}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectUser(u.id)}
                      className="flex items-center gap-2.5 w-full p-2 rounded-lg hover:bg-muted text-sm transition-colors"
                    >
                      <UserAvatar user={u} size="sm" />
                      <span className="font-medium">{u.username}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />

          <Link
            to="/feed"
            className={cn(
              "p-2 rounded-full hover:bg-muted transition-colors",
              isActive("/feed") ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Home size={21} />
          </Link>

          <Link
            to="/friends"
            className="relative p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
          >
            <UserPlus size={21} />
            <NavBadge count={friendRequestCount} />
          </Link>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground">
                <Bell size={21} />
                <NavBadge count={unreadCount} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <NotificationDropdown />
            </DropdownMenuContent>
          </DropdownMenu>

          {user && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full ml-1 ring-2 ring-transparent hover:ring-border transition-all">
                  <UserAvatar user={user} size="sm" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => navigate(`/profile/${user.id}`)}
                >
                  Trang cá nhân
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  Cài đặt
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};
