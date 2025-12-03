
'use client';

import { useEffect, useRef, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { databaseWater, db } from '@/lib/firebase';
import { useToast } from './use-toast';

type WaterQualityData = {
  DO: number;
  PH: number;
  TDS: number;
  Temp: number;
};

// Custom hook to handle data averaging and logging to Firestore
export function useDataAveraging(rtdbPath: string, intervalSeconds: number) {
  const { toast } = useToast();
  const dataBuffer = useRef<WaterQualityData[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // 1. Listener for real-time data
    const dataRef = ref(databaseWater, rtdbPath);
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const newData = snapshot.val();
      if (newData) {
        dataBuffer.current.push(newData);
      }
    }, (error) => {
      console.error("Error reading from Realtime Database:", error);
      toast({
        variant: "destructive",
        title: "Realtime DB Error",
        description: "Could not connect to the water quality sensor data.",
      });
    });

    // 2. Interval for averaging and logging
    const logInterval = setInterval(() => {
      if (dataBuffer.current.length === 0) {
        console.log("No data in buffer, skipping log.");
        return;
      }

      const buffer = [...dataBuffer.current];
      dataBuffer.current = []; // Clear buffer for the next interval

      // Calculate average
      const sum = buffer.reduce((acc, data) => {
        acc.DO += data.DO || 0;
        acc.PH += data.PH || 0;
        acc.TDS += data.TDS || 0;
        acc.Temp += data.Temp || 0;
        return acc;
      }, { DO: 0, PH: 0, TDS: 0, Temp: 0 });

      const count = buffer.length;
      const averageData = {
        avg_DO: sum.DO / count,
        avg_PH: sum.PH / count,
        avg_TDS: sum.TDS / count,
        avg_Temp: sum.Temp / count,
        timestamp: serverTimestamp(),
        sample_count: count,
      };

      // 3. Save to Firestore
      const logRef = collection(db, "water_quality_logs");
      addDoc(logRef, averageData)
        .then(() => {
          console.log("Successfully logged average data to Firestore:", averageData);
        })
        .catch((error) => {
          console.error("Error writing to Firestore:", error);
          toast({
            variant: "destructive",
            title: "Firestore Error",
            description: "Failed to save average sensor data.",
          });
        });

    }, intervalSeconds * 1000);

    // Cleanup on unmount
    return () => {
      unsubscribe();
      clearInterval(logInterval);
    };
  }, [mounted, rtdbPath, intervalSeconds, toast]);

  // This hook does not return anything, it just runs in the background.
}
