import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8">
          <Image
            src="/jaothui-logo.png"
            alt="JAOTHUI Logo"
            width={120}
            height={120}
            className="mx-auto"
          />
        </div>

        <h1 className="text-2xl font-bold mb-4 text-secondary">
          ยินดีต้อนรับสู่ระบบ E-ID
        </h1>

        <p className="text-gray-600 mb-8">ข้อมูลสัตว์</p>

        <div className="space-y-4">
          <button className="btn btn-primary w-full">
            Test DaisyUI Orange Theme
          </button>

          <div className="card-custom p-4">
            <h3 className="font-semibold mb-2">การจัดการสัตว์</h3>
            <p className="text-sm text-gray-600">ควาย, ไก่, วัว, หมู, ม้า</p>
          </div>
        </div>
      </div>
    </main>
  );
}
