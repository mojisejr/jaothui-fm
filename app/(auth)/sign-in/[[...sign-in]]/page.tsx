import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function SignInPage() {
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

        {/* Login Title */}
        <div className="mb-10">
          <h1 className="text-[24px] font-bold text-[#333333] mb-3">
            ยินดีต้อนรับ
          </h1>
          <p className="text-[16px] text-[#666666] mb-10">
            โปรดเข้าสู่ระบบ
          </p>
        </div>

        {/* Clerk Sign In Component with Custom Styling */}
        <div className="clerk-override">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-none bg-transparent",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "bg-[#f5f5f5] border border-[#e0e0e0] rounded-[10px] text-[#333333] hover:bg-[#e0e0e0]",
                formFieldInput: "bg-[#f5f5f5] border border-[#e0e0e0] rounded-[10px] px-5 py-[15px] text-[16px] w-full",
                formFieldLabel: "text-[#333333] text-[14px] mb-2",
                formButtonPrimary: "bg-[#f39c12] hover:bg-[#e67e22] text-white rounded-[25px] py-[15px] px-[50px] font-bold text-[16px] w-4/5 mx-auto",
                footerActionLink: "text-[#666666] text-[14px] hover:text-[#f39c12]",
                formFieldInputShowPasswordButton: "text-[#666666]",
                identityPreviewEditButton: "text-[#f39c12]",
                formResendCodeLink: "text-[#666666] text-[14px] underline hover:text-[#f39c12]",
                otpCodeFieldInput: "bg-[#f5f5f5] border border-[#e0e0e0] rounded-[10px]",
              },
              layout: {
                socialButtonsPlacement: "bottom"
              }
            }}
            redirectUrl="/dashboard"
          />
        </div>
      </div>
    </main>
  );
}