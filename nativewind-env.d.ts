/// <reference types="nativewind/types" />

declare module "nativewind/types" {
  interface CustomTheme {
    colors: {
      primary: {
        0: string;
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
        950: string;
      };
      secondary: {
        0: string;
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
        950: string;
      };
      sleep: {
        deep: string;
        rem: string;
        light: string;
        wake: string;
        background: string;
        surface: string;
        card: string;
      };
      success: {
        50: string;
        500: string;
        600: string;
      };
      warning: {
        50: string;
        500: string;
        600: string;
      };
      error: {
        50: string;
        500: string;
        600: string;
      };
      info: {
        50: string;
        500: string;
        600: string;
      };
      text: {
        primary: string;
        secondary: string;
        muted: string;
        inverse: string;
      };
      background: {
        primary: string;
        secondary: string;
        surface: string;
        card: string;
      };
    };
  }
}