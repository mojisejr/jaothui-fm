import Image from "next/image";
import Link from "next/link";
import { currentUser } from '@clerk/nextjs/server';

export default async function SuccessPage() {
  const user = await currentUser();
  const userName = user?.firstName || "ผู้ใช้";

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-sm mx-auto px-5 py-[60px] text-center">
        {/* Logo Section */}
        <div className="mb-8">
          <Image
            src="/jaothui-logo.png"
            alt="JAOTHUI Logo"
            width={120}
            height={120}
            className="mx-auto mb-8"
          />
          <div className="text-[#f39c12] text-[32px] font-bold mb-[60px]">
            JAOTHUI
          </div>
        </div>

        {/* Success Message */}
        <div className="mb-[80px]">
          <h1 className="text-[24px] font-bold text-[#333333] mb-5">
            ยินดีต้อนรับ คุณ{userName}
          </h1>
          <p className="text-[16px] text-[#666666]">
            กรุณาเข้าสู่ระบบเพื่อเริ่มรายการ
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