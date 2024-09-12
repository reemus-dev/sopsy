import {$} from "zx";
import chokidar from "chokidar";
import _ from "lodash";

type SecretValues = Record<string, unknown>;

export class SecretsManager {
  values: SecretValues | null = null;
  watcher: chokidar.FSWatcher | null = null;

  private constructor(private file: string) {}

  getValue = async (key?: string) => {
    const value = !key ? this.values : _.get(this.values, key);
    const type = _.isPlainObject(value)
      ? "object"
      : _.isArray(value)
        ? "array"
        : _.isNil(value)
          ? "null"
          : "scalar";
    return {type, value};
  };

  stop = async (): Promise<void> => {
    await this.watcher?.close();
  };

  private decrypt = async (): Promise<SecretValues> => {
    const {stdout} = await $`sops -d --output-type json ${this.file}`;
    const values = JSON.parse(stdout.trim());
    this.values = values;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return values;
  };

  private watch = async (): Promise<void> => {
    this.watcher = chokidar.watch(this.file, {
      atomic: true,
      persistent: true,
      ignoreInitial: true,
    });

    this.watcher?.on("change", () => {
      this.decrypt().catch(console.error);
    });
  };

  static async init(file: string): Promise<SecretsManager> {
    const manager = new SecretsManager(file);
    await manager.decrypt();
    await manager.watch();
    return manager;
  }
}
