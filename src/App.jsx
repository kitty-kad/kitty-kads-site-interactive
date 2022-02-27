import { Buffer } from "buffer";
import { useState, useEffect } from "react";
import { Navigation } from "./components/navigation";
import { Header } from "./components/game/game";
import { Roadmap } from "./components/roadmap";
import { About } from "./components/about";
import { Highlights } from "./components/highlights";
import { Footer } from "./components/footer";
import { Socials } from "./components/socials";
import { Projects } from "./components/projects";
import JsonData from "./data/data.json";
import SmoothScroll from "smooth-scroll";
import { PactContextProvider } from "./wallet/pact-wallet";

global.Buffer = Buffer;

export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
});

const App = () => {
  const [landingPageData, setLandingPageData] = useState({});
  useEffect(() => {
    setLandingPageData(JsonData);
  }, []);

  return (
    <div>
      <PactContextProvider>
        <Navigation />
        <Header data={landingPageData.Header} />
        <About data={landingPageData.About} />
        <Roadmap data={landingPageData.Roadmap} />
        <Highlights data={landingPageData.Highlights} />
        <Projects data={landingPageData.Projects} />
        <Socials data={landingPageData.Socials} />
        <Footer />
      </PactContextProvider>
    </div>
  );
};

export default App;
