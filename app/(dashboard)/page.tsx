import { getOrCreateProfile } from '@/lib/user';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@clerk/nextjs';
import Image from 'next/image';

export default async function DashboardPage() {
  const profile = await getOrCreateProfile();
  
  if (!profile) {
    redirect('/sign-in');
  }

  const farm = profile.ownedFarms[0]; // Get the first farm
  const animalCount = farm?.animals?.length || 0;

  return (
    <div className="bg-[#4a4a4a] min-h-screen">
      {/* User Greeting */}
      <div className="bg-white px-5 py-5">
        <p className="text-[#333333] text-[16px]">
          สวัสดี! คุณ{profile.firstName} {profile.lastName}
        </p>
      </div>

      {/* User Card */}
      <div className="bg-white mx-5 my-5 p-5 rounded-[15px] flex items-center gap-4">
        <div className="w-[100px] h-[100px] bg-[#f5f5f5] rounded-[15px] flex items-center justify-center">
          <Image
            src="/jaothui-logo.png"
            alt="Farm Avatar"
            width={60}
            height={60}
          />
        </div>
        <div className="flex-1">
          <div className="text-[#333333] text-[14px] mb-1">
            ชื่อฟาร์ม : {farm?.farmName || 'ฟาร์มของฉัน'}
          </div>
          <div className="text-[#333333] text-[14px] mb-1">
            รหัสฟาร์ม : {farm?.id?.substring(0, 8) || 'xxxxxxxx'}
          </div>
          <div className="text-[#333333] text-[14px]">
            หมายเลข : {profile.phoneNumber}
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="bg-white mx-5 mb-5 p-5 rounded-[15px]">
        <div className="space-y-3">
          <div className="bg-[#f9f9f9] rounded-[10px] p-4 flex justify-between items-center">
            <span className="text-[#333333] text-[14px]">
              ข้อมูลกระบือภายในฟาร์ม
            </span>
            <span className="bg-[#f39c12] text-white text-[12px] px-2 py-1 rounded-full">
              {animalCount}
            </span>
          </div>
          
          <div className="bg-[#f9f9f9] rounded-[10px] p-4 flex justify-between items-center">
            <span className="text-[#333333] text-[14px]">
              เพิ่มข้อมูลกระบือในฟาร์ม
            </span>
            <button className="bg-[#cccccc] text-[#666666] text-[12px] px-4 py-2 rounded-[15px]">
              คลิก
            </button>
          </div>

          <div className="bg-[#f9f9f9] rounded-[10px] p-4 flex justify-between items-center">
            <span className="text-[#333333] text-[14px]">
              หมายเลขประจำตัวสัตว์
            </span>
            <button className="bg-[#cccccc] text-[#666666] text-[12px] px-4 py-2 rounded-[15px]">
              ค้นหา
            </button>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="flex justify-center px-5 pb-5">
        <SignOutButton redirectUrl="/">
          <button className="bg-transparent border border-white text-white text-[16px] py-[15px] px-[30px] rounded-[25px] w-4/5">
            ออกจากระบบ
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}