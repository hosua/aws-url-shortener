import { useState, useCallback } from "react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Switch } from "@components/ui/switch";
import { Label } from "@components/ui/label";
import { Link2, CheckCircle2, Copy, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { shortenUrl } from "@lib/urlShortener";
import { Spinner } from "@components/ui/spinner";
import TimeDurationPicker from "@components/TimeDurationPicker";
import moment, { type Duration } from "moment";

const MS_IN_DAY = 24 * 60 * 60 * 1000;

export const UrlShortenerPage = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const [expiration, setExpiration] = useState<Duration | null>(null);
  const [noExpiration, setNoExpiration] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShortenedUrl(null);
    setLoading(true);

    try {
      // DynamoDB expects seconds for ttl but Date().getTime() returns ms, so
      // we'll just use ms as input, then convert it to s in the Lambda.
      const ttl = noExpiration
        ? 0
        : expiration
          ? expiration.asMilliseconds()
          : MS_IN_DAY;
      const response = await shortenUrl({ originalUrl: url, ttl });
      const fullShortUrl = `${window.location.origin}/s/${response.short_url}`;
      setShortenedUrl(fullShortUrl);
      setUrl("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to shorten URL. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (shortenedUrl) {
      await navigator.clipboard.writeText(shortenedUrl);
      toast.success("URL copied to clipboard");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-2 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Link2 size={40} />
          URL Shortener
        </h1>
        <p className="text-muted-foreground">
          Shorten your URLs quickly and easily.
        </p>
        <p className="text-muted-foreground">
          You cannot set expiration greater than 5 years.
        </p>
      </div>
      <div className="mt-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-semibold">Expiration Time</h2>
          <div className="flex items-center gap-2 ms-3 mt-1">
            <Switch
              id="no-expiration"
              checked={noExpiration}
              onCheckedChange={setNoExpiration}
            />
            <Label htmlFor="no-expiration" className="cursor-pointer">
              Never expire
            </Label>
          </div>
        </div>
        <TimeDurationPicker
          onChange={useCallback((timeDuration) => {
            setExpiration(moment.duration(timeDuration));
          }, [])}
          disabled={noExpiration}
        />
      </div>
      <div className="max-w-2xl mx-auto space-y-4 mt-6">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="url"
            placeholder="Enter URL to shorten..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
            disabled={loading}
            required
          />
          <Button variant="default" type="submit" disabled={loading}>
            {loading ? <Spinner /> : "Shorten"}
          </Button>
        </form>

        {shortenedUrl && (
          <div className="space-y-2">
            <Alert>
              <CheckCircle2 className="text-green-600" />
              <AlertDescription className="flex items-center justify-between gap-2">
                <span className="break-all">{shortenedUrl}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  <Copy className="size-4" />
                </Button>
              </AlertDescription>
            </Alert>
            <Alert variant="default">
              <AlertTriangle className="text-yellow-600" />
              <AlertDescription>
                Shortened URLs will stop working when they expire!
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
};

export default UrlShortenerPage;
