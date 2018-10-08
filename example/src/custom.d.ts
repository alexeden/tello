declare module "worker-loader!*" {
  class WebpackWorker extends Worker {
    constructor();
  }

  export = WebpackWorker;
}


declare module "*.wasm" {
  const url: string;
  export = url;
}

declare module "*.html" {
  const template: string;
  export = template;
}
