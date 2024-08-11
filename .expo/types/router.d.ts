/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(auth)` | `/(auth)/authContext` | `/(auth)/sign-in` | `/(auth)/sign-up` | `/(screens)` | `/(screens)/chat` | `/(tabs)` | `/(tabs)/` | `/(tabs)/explore` | `/(tabs)/profile` | `/_sitemap` | `/authContext` | `/chat` | `/explore` | `/profile` | `/sign-in` | `/sign-up`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
