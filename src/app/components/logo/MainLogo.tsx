import React from "react";
import Image from "next/image";
import guildLogo from "../../../../public/DAG-logo.png";
interface MainLogoProps {
  width?: number;
  height?: number;
  classNames?: string;
}
const MainLogo: React.FC<MainLogoProps> = ({
  width = 100,
  height = 100,
  classNames = "",
}) => {
  return (
    <div className={`containLogo ${classNames}`}>
      <Image
        src={guildLogo}
        alt="Adventure guild logo"
        width={width}
        height={height}
      />
    </div>
  );
};

export default MainLogo;
