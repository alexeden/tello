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
