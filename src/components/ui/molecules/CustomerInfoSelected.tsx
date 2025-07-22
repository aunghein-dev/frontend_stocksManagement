import Image from "next/image";
import dayjs from "dayjs";

interface CustomerInfoSelectedProps {
  imgUrl: string;
  name: string;
  orderNo: string;
}

export default function CustomerInfoSelected({imgUrl, name, orderNo} : CustomerInfoSelectedProps) {
  return (
    <div className="flex items-center justify-between 
                    w-full sm:text-sm text-xs px-2 h-[76px]">
        
        <div className="flex flex-row items-center gap-2">
          <Image src={imgUrl || "/man.png"} alt="User" width={50} height={50}
              className="rounded-full ring-2 ring-blue-300"/>
          <div className="flex flex-col text-left gap-1">
            <span className="font-semibold text-sm">{name}</span>
            <span className="text-xs text-gray-500">#{orderNo.toLocaleUpperCase().substring(0, 8)}</span>
          </div>
        </div>
        <div className="flex flex-col text-right gap-1">
            <span className="text-xs text-gray-500">{dayjs(new Date()).format("ddd, MMM, YYYY")}</span>
            <span className="text-xs text-gray-500">{dayjs(new Date()).format("hh:mm A")}</span>
        </div>
    </div>
  );
}