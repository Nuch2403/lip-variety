import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container-page section">
      <div className="card p-10 text-center">
        <h1 className="font-display text-4xl font-semibold text-berry">404</h1>
        <p className="mt-2 text-ink/70">ไม่พบหน้าที่คุณต้องการ</p>
        <div className="mt-6 flex gap-6 justify-center items-center">
          <Link to="/" className="btn-ghost">กลับหน้าแรก</Link>
          <Link to="/quiz/step1-skintone" className="btn-primary">เริ่มควิซ</Link>
        </div>
      </div>
    </div>
  );
}
