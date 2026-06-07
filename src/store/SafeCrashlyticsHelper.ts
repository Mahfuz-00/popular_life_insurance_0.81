// SafeCrashlyticsHelper.ts
import { ToastAndroid, InteractionManager } from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';
import { useRef, useEffect, Dispatch, SetStateAction, useState } from 'react';

/**
 * Initialize global crash handlers
 * Call this once in your App.tsx or index.tsx
 */
export const initCrashlytics = (): void => {
  // ===== 1. JS Exceptions =====
  const defaultHandler = (ErrorUtils as any).getGlobalHandler() as (error: any, isFatal?: boolean) => void;

  (ErrorUtils as any).setGlobalHandler((error: Error, isFatal?: boolean) => {
    crashlytics().recordError(error); // send JS error
    defaultHandler(error, isFatal); // call default handler
  });

  // ===== 2. Toast wrapper =====
  (global as any).safeToast = (msg: string | undefined | null): void => {
    if (!msg) return;

    InteractionManager.runAfterInteractions(() => {
      try {
        ToastAndroid.show(msg, ToastAndroid.SHORT);
      } catch (e) {
        console.warn('Toast failed', e);
        crashlytics().recordError(e as Error);
      }
    });
  };
};

/**
 * Hook for safe UI updates (avoid Fabric mounting crash)
 * Usage: const [state, setState] = useSafeState<number>(0)
 */
export function useSafeState<T>(initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const isMounted = useRef(true);
  const stateRef = useRef<T>(initialValue);
  const [, forceUpdate] = useSafeForceUpdate(); // optional for re-render

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const safeSetState = (value: SetStateAction<T>): void => {
    if (!isMounted.current) return;

    stateRef.current =
      typeof value === 'function'
        ? (value as (prevState: T) => T)(stateRef.current)
        : value;

    forceUpdate(); // trigger re-render
  };

  return [stateRef.current, safeSetState];
}

/**
 * Optional: simple force update hook for useSafeState
 */
function useSafeForceUpdate(): [number, () => void] {
  const [tick, setTick] = useState(0);
  const forceUpdate = () => setTick((t) => t + 1);
  return [tick, forceUpdate];
}