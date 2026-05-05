import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Logo } from "../components/shared/logo";
import { Link } from "react-router-dom";
import { ModeToggle } from "../components/mode-toggle";

// ─── Mock data ────────────────────────────────────────────────────────────────
const FEED_POSTS = [
  {
    id: 1,
    avatar: "HN",
    name: "Hà Ngân",
    time: "2 phút",
    text: "Chiều nay trà sữa không? ☕",
    likes: 12,
  },
  {
    id: 2,
    avatar: "TL",
    name: "Tuấn Lâm",
    time: "15 phút",
    text: "Vừa leo xong Fansipan 🏔️ View đỉnh!",
    likes: 48,
  },
  {
    id: 3,
    avatar: "ML",
    name: "Minh Lý",
    time: "1 giờ",
    text: "Ai đang ở Đà Lạt không? Cần gợi ý quán 🌿",
    likes: 7,
  },
];

const FEATURES = [
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
        />
      </svg>
    ),
    title: "Kết bạn & gợi ý",
    desc: "Tìm người quen qua bạn chung, sở thích và vị trí. Mạng lưới của bạn luôn được mở rộng tự nhiên.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    ),
    title: "Stories 24h",
    desc: "Chia sẻ khoảnh khắc sống động biến mất sau 24 giờ. Chân thực, nhẹ nhàng, không áp lực.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
        />
      </svg>
    ),
    title: "Bảng tin cá nhân hoá",
    desc: "Feed thông minh hiển thị đúng nội dung bạn quan tâm — không spam, không quảng cáo nhiễu.",
  },
];

const STATS = [
  { value: "2M+", label: "Người dùng" },
  { value: "50K", label: "Bài viết mỗi ngày" },
  { value: "12", label: "Quốc gia" },
];

const STEPS = [
  {
    num: "01",
    title: "Tạo tài khoản",
    desc: "Đăng ký trong 30 giây, không cần thẻ tín dụng hay xác minh phức tạp.",
  },
  {
    num: "02",
    title: "Kết bạn người quen",
    desc: "Hệ thống gợi ý thông minh giúp bạn tìm lại bạn bè, đồng nghiệp, người thân.",
  },
  {
    num: "03",
    title: "Chia sẻ khoảnh khắc",
    desc: "Đăng ảnh, story, cảm xúc — tất cả đến đúng người bạn muốn.",
  },
];

// ─── Phone Mockup ─────────────────────────────────────────────────────────────
function PhoneMockup() {
  return (
    <div className="relative mx-auto w-60 select-none">
      <div className="absolute inset-0 rounded-[40px] blur-3xl opacity-20 bg-primary scale-110 pointer-events-none" />
      <div className="relative rounded-[36px] border-[6px] border-foreground/10 bg-background shadow-2xl overflow-hidden">
        {/* Status bar */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <span className="text-[10px] font-semibold text-muted-foreground">
            9:41
          </span>
          <div className="w-16 h-3 rounded-full bg-foreground/10" />
          <div className="flex gap-1">
            <div className="w-3 h-2 rounded-sm bg-foreground/30" />
            <div className="w-1 h-2 rounded-sm bg-foreground/30" />
          </div>
        </div>
        {/* App header */}
        <div className="px-4 pb-2 flex items-center justify-between border-b border-border">
          <span className="text-sm font-bold tracking-tight text-foreground">
            Vire
          </span>
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-muted" />
            <div className="w-6 h-6 rounded-full bg-muted" />
          </div>
        </div>
        {/* Stories */}
        <div className="flex gap-2 px-3 py-2">
          {["HN", "TL", "ML", "PQ"].map((init, i) => (
            <div
              key={init}
              className="flex flex-col items-center gap-0.5 shrink-0"
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-offset-1 ring-primary/60"
                style={{
                  background: ["#6366f1", "#ec4899", "#10b981", "#f59e0b"][i],
                }}
              >
                {init}
              </div>
            </div>
          ))}
        </div>
        {/* Feed */}
        <div className="px-3 space-y-2 pb-4">
          {FEED_POSTS.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-border bg-muted/30 p-2"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">
                  {p.avatar}
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-foreground leading-none">
                    {p.name}
                  </p>
                  <p className="text-[9px] text-muted-foreground">{p.time}</p>
                </div>
              </div>
              <p className="text-[10px] text-foreground/80 leading-snug">
                {p.text}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <svg
                  className="w-2.5 h-2.5 text-rose-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
                <span className="text-[9px] text-muted-foreground">
                  {p.likes}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ scrolled }: { scrolled: boolean }) {
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border/60 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-3">
          <ModeToggle />
          <Button
            variant="outline"
            size="sm"
            className="rounded-full px-5 font-medium"
            asChild
          >
            <Link to={"/login"}>Đăng nhập</Link>
          </Button>
          <Button size="sm" className="rounded-full px-5 font-medium">
            <Link to={"/register"}>Đăng ký</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Navbar scrolled={scrolled} />

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="min-h-screen flex items-center pt-16 pb-20 px-6">
        <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Mạng xã hội thế hệ mới
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] text-foreground">
              Kết nối thật sự với những người bạn quan tâm.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
              Vire giúp bạn duy trì mối quan hệ ý nghĩa — không nhiễu, không
              spam, chỉ những người thực sự quan trọng với bạn.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                size="lg"
                className="rounded-full px-7 font-semibold text-base shadow-md shadow-primary/20"
              >
                <Link to={"/register"}>Tạo tài khoản miễn phí</Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="rounded-full px-7 font-semibold text-base"
              >
                Tìm hiểu thêm
                <svg
                  className="w-4 h-4 ml-1.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Button>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">
              Tính năng
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Tại sao nên dùng Vire?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Mọi thứ bạn cần để duy trì các mối quan hệ thực sự — được thiết kế
              đơn giản và thông minh.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-border bg-muted/20 p-6 hover:bg-muted/40 hover:border-primary/30 transition-all duration-200 space-y-4"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">
              Cách hoạt động
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Bắt đầu trong 3 bước
            </h2>
          </div>
          <div className="relative grid sm:grid-cols-3 gap-8">
            {/* Connector (desktop) */}
            <div className="hidden sm:block absolute top-8 left-[calc(33%+20px)] right-[calc(33%+20px)] border-t-2 border-dashed border-border" />
            {STEPS.map((s) => (
              <div
                key={s.num}
                className="relative z-10 flex flex-col items-center text-center space-y-3"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-md shadow-primary/25">
                  {s.num}
                </div>
                <h3 className="font-semibold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-50">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label} className="space-y-1">
              <p className="text-5xl font-bold tracking-tight">{s.value}</p>
              <p className="text-primary-foreground/70 text-sm font-medium">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 border-t border-border/50">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Sẵn sàng chưa?
          </h2>
          <p className="text-muted-foreground text-lg">
            Hàng triệu người đã dùng Vire để giữ kết nối với những người quan
            trọng. Đến lượt bạn.
          </p>
          <Button
            size="lg"
            className="rounded-full px-10 py-6 text-base font-semibold shadow-lg shadow-primary/25"
          >
            <Link to={"/register"}>Đăng ký ngay — Miễn phí</Link>
          </Button>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/50 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left space-y-0.5">
            <p className="text-base font-bold tracking-tight text-foreground">
              Vire
            </p>
            <p className="text-xs text-muted-foreground">
              Kết nối thật sự với những người bạn quan tâm.
            </p>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {[
              "Giới thiệu",
              "Điều khoản sử dụng",
              "Chính sách bảo mật",
              "Liên hệ",
            ].map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link}
              </a>
            ))}
          </nav>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Vire. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
