import Link from "next/link";

import { cn } from "@/lib/utils";

type Props = {
  classname?: string;
};

export const Header: React.FC<Props> = ({ classname }) => {
  return (
    <header className={cn(classname)}>
      <div className="p-4 grid grid-cols-3 w-full h-16 items-center">
        <Link href="/" className="justify-self-start hover:font-bold hover:text-amber-600 transition-all hover:cursor-pointer hover:text-xl">LOGO</Link>
        <div className="justify-self-center flex gap-2">
          <span className=" duration-300 transition-all hover:font-bold hover:cursor-pointer hover:text-amber-600 hover:text-xl">work</span>
          <Link href="/info" className="duration-300 transition-all hover:font-bold hover:cursor-pointer hover:text-amber-600 hover:text-xl">info</Link>
          <span className="duration-300 transition-all hover:font-bold hover:cursor-pointer hover:text-amber-600 hover:text-xl">blog</span>
        </div>
        <div className="justify-self-end hover:text-amber-600 transition-all hover:font-bold hover:cursor-pointer hover:text-xl">instagram</div>
      </div>
    </header>
  );
};
