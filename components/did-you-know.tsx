"use client";

import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TIPS = [
  "Top D2C brands publish 8-12 blog posts per month. Most audited brands publish fewer than 2.",
  "Brands with active SMS channels see 12-18% higher repeat purchase rates than email-only brands.",
  "PDP-to-cart benchmark for Wellness is 6-8%. Below 4% signals a conversion infrastructure problem.",
  "Cart abandonment in Indian D2C averages 75%. A 3-touch recovery flow typically recovers 12-18%.",
  "Subscription brands with 30%+ revenue from subscriptions have 2.3x higher CLV than transactional brands.",
];

const INTERVAL = 4000;

export function DidYouKnow() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % TIPS.length);
        setVisible(true);
      }, 300);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <CardTitle className="text-base">Did you know?</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p
          className="text-sm text-muted-foreground leading-relaxed transition-opacity duration-300"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {TIPS[index]}
        </p>
        <div className="mt-4 flex gap-1">
          {TIPS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setVisible(false); setTimeout(() => { setIndex(i); setVisible(true); }, 300); }}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i === index ? "bg-primary" : "bg-border hover:bg-muted-foreground/40"}`}
              aria-label={`Tip ${i + 1}`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
