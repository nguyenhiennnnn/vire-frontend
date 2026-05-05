import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Home, SearchX } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="text-center space-y-6 max-w-sm">
        <p className="text-[120px] font-black leading-none text-muted-foreground/15 select-none tracking-tight">
          404
        </p>

        <div className="flex justify-center -mt-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <SearchX size={28} className="text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Trang không tồn tại
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Đường dẫn bạn truy cập không tồn tại hoặc đã bị xoá.
            <br />
            Kiểm tra lại URL hoặc quay về trang chủ.
          </p>
        </div>

        <Link to="/feed">
          <Button className="gap-2">
            <Home size={15} />
            Về trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
}
