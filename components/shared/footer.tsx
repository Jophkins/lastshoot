import { cn } from "@/lib/utils";

type Props = {
  classname?: string;
};

export const Footer: React.FC<Props> = ({ classname }) => {
  return (
    <div className={cn("mt-8 p-2 border-t", classname)}>
      <p>email@email.com</p>
      <p>All right reserved</p>
    </div>
  );
};
