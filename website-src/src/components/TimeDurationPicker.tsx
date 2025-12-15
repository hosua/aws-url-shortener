import { useState, useEffect } from "react";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";

interface TimeDuration {
  seconds?: number;
  minutes?: number;
  hours?: number;
  days?: number;
}

interface TimeDurationPickerProps {
  onChange: (timeDuration: TimeDuration) => void;
  disabled?: boolean;
}

export const TimeDurationPicker = ({
  onChange,
  disabled = false,
}: TimeDurationPickerProps) => {
  const [timeDuration, setTimeDuration] = useState<TimeDuration>({
    days: 1,
  });

  useEffect(() => {
    onChange(timeDuration);
  }, [timeDuration, onChange]);

  return (
    <div className="flex gap-4 items-end">
      <div className="space-y-2">
        <Label htmlFor="days">Days</Label>
        <Input
          id="days"
          type="number"
          placeholder="0"
          value={timeDuration?.days || 0}
          onChange={(e) => {
            // DynamoDB has a 5 year TTL maximum
            // 365 * 5 = 1825
            // - 1 = 1824 to account for hours and minutes that could be added
            const value = Number(e.target.value);
            const clampedValue = Math.min(Math.max(value, 0), 1824);
            setTimeDuration({
              ...timeDuration,
              days: clampedValue,
            });
          }}
          min="0"
          max="1824"
          className="w-15"
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="hours">Hours</Label>
        <Input
          id="hours"
          type="number"
          placeholder="0"
          value={timeDuration?.hours || 0}
          onChange={(e) => {
            const value = Number(e.target.value);
            const clampedValue = Math.min(Math.max(value, 0), 23);
            setTimeDuration({
              ...timeDuration,
              hours: clampedValue,
            });
          }}
          min="0"
          max="23"
          className="w-11"
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="minutes">Mins</Label>
        <Input
          id="minutes"
          type="number"
          placeholder="0"
          value={timeDuration?.minutes || 0}
          onChange={(e) => {
            const value = Number(e.target.value);
            const clampedValue = Math.min(Math.max(value, 0), 59);
            setTimeDuration({
              ...timeDuration,
              minutes: clampedValue,
            });
          }}
          min="0"
          max="59"
          className="w-11"
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default TimeDurationPicker;
