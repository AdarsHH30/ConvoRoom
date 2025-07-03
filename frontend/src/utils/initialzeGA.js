export const initializeGA=()=> {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  console.log("Google Analytics Measurement ID:", measurementId);
  if (!measurementId) {
    console.warn("Google Analytics Measurement ID not found");
    return;
  }

  const gaScript = document.createElement("script");
  gaScript.async = true;
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  gaScript.onload = () => {
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag("js", new Date());
    gtag("config", measurementId);
  };

  document.head.appendChild(gaScript);
}

