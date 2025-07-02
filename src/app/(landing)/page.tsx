import Image from "next/image";
import guildLogo from "../../../public/DAG-logo.png";
import PrimaryNavBar from "../components/navbars/Primary";

export default function Home() {
  return (
    <>
      <PrimaryNavBar />
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
    </>
  );
}
