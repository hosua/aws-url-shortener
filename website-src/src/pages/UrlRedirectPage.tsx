import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, AlertDescription } from "@components/ui/alert";
import { getOriginalUrl } from "@lib/urlShortener";
import { Loader2 } from "lucide-react";

export const UrlRedirectPage = () => {
  const { shortUrl } = useParams<{ shortUrl: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAndRedirect = async () => {
      if (!shortUrl) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const data = await getOriginalUrl({ shortUrl });

        if (!data || !data.original_url) {
          setError(true);
          setLoading(false);
          return;
        }

        window.location.href = data.original_url;
      } catch (err) {
        console.error(err);
        setError(true);
        setLoading(false);
      }
    };

    fetchAndRedirect();
  }, [shortUrl]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="size-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Redirecting you to another page...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>
              This shortened URL is either invalid or expired.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return null;
};

export default UrlRedirectPage;
