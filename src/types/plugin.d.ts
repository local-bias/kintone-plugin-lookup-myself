declare namespace kintone {
  namespace plugin {
    /** プラグインがアプリ単位で保存する設定情報🔌 */
    type Storage = {
      conditions: Condition[];
    };

    /** プラグインの制御単位の設定情報🔌 */
    type Condition = {
      related: string;
      target: string;
      copies: { from: string; to: string }[];
      sees: string[];
      enablesCache: boolean;
      autoLookup: boolean;
    };
  }
}
