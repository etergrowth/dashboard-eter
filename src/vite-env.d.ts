/// <reference types="vite/client" />

// Declaração de módulos para importar ficheiros HTML como strings
declare module '*.html?raw' {
  const content: string;
  export default content;
}
