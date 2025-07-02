import Image from "next/image";
import guildLogo from "../../../public/DAG-logo.png";
import "../page.scss";
export default function Home() {
  return (
    <main>
      <div>
        <div className="containLogo">
          <Image
            src={guildLogo}
            alt="Adventure guild logo"
            width={400}
            height={400}
          />
        </div>
        <h1>Welcome fellow adventures</h1>
      </div>
    </main>
  );
}
