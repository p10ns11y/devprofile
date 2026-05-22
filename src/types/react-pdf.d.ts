import "@react-pdf/renderer";

declare module "@react-pdf/renderer" {
  interface ViewProps {
    bookmark?: string | { title: string; fit?: boolean };
    id?: string;
    break?: boolean;
  }

  interface TextProps {
    bookmark?: string;
  }
}
