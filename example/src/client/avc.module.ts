interface AvcModuleOptions {
  totalMemory?: number;
}

export class AvcModule {
  static readonly WASM_PAGE_SIZE = 0x10000;
  private readonly table: WebAssembly.Table;
  constructor(
    public opts: AvcModuleOptions
  ) {
    // this.table =

  }

}
