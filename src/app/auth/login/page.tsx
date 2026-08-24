import { LoginForm } from "./ui/LoginForm";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen pt-32 items-center">

        <div className="mb-5">
          <Image
            src="/logo-grande.png"
            alt=""
            width={250}
            height={250}
          />
        </div>

        <LoginForm /> 

    </div>
    
  );
}