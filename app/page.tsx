import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-sm mx-auto px-5 py-10 text-center">
        {/* Logo Section */}
        <div className="mb-8">
          <Image
            src="/jaothui-logo.png"
            alt="JAOTHUI Logo"
            width={120}
            height={120}
            className="mx-auto mb-8"
          />
          <div className="text-[#f39c12] text-[32px] font-bold mb-10">
            JAOTHUI
          </div>
        </div>

        {/* Welcome Text */}
        <div className="mb-10">
          <h1 className="text-[20px] font-bold text-[#333333] mb-3">
            ยินดีต้อนรับเข้าสู่ระบบ E-ID
          </h1>
          <p className="text-[16px] text-[#666666] mb-10">
            ข้อมูลควาย
          </p>
        </div>

        {/* Powered by */}
        <div className="mb-[60px]">
          <p className="text-[12px] text-[#999999]">
            Powered by JAOTHUI
          </p>
        </div>

        {/* Action Button */}
        <Link
          href="/sign-in"
          className="block w-4/5 mx-auto bg-[#f39c12] text-white text-[16px] font-bold py-[15px] px-[50px] rounded-[25px] hover:bg-[#e67e22] transition-colors"
        >
          เข้าสู่ระบบ
        </Link>
      </div>
    </main>
  );
}
