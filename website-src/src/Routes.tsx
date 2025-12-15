import { Routes, Route } from "react-router-dom";
import UrlShortenerPage from "@pages/UrlShortenerPage";
import UrlRedirectPage from "@pages/UrlRedirectPage";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<UrlShortenerPage />} />
      <Route path="/s/:shortUrl" element={<UrlRedirectPage />} />
    </Routes>
  );
};
