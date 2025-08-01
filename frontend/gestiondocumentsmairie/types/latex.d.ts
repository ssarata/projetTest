declare module 'latex.js' {
  export class HtmlGenerator {
  constructor(options?: {
      hyphenate?: boolean;
      baseURL?: string;
    });  }
  export function parse(latexString: string, options?: { generator: HtmlGenerator }): {
    htmlDocument: () => { outerHTML: string };
  };
}