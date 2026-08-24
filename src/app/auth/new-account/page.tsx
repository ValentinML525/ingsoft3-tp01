import Link from 'next/link';
import { RegisterForm } from './ui/RegisterFrom';
import Image from "next/image";

export default function NewAccountPage() {
  return (
    <div className="flex flex-col min-h-screen pt-32 items-center">

        <div className="">
          <Image
            src="/logo-grande.png"
            alt=""
            width={250}
            height={250}
          />
        </div>

      <RegisterForm/>
      
    </div>
  );
}