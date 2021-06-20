import { PLUGIN_NAME } from '@common/constants';

/**
 * イベント実行に必要なプロパティ情報
 * 必須はactionのみで、eventsに指定がない場合は一覧表示イベント(app.record.index.show)が設定されます
 */
export type Config = Readonly<{
  enables?: kintone.Enables;
  events?: string[] | ((pluginId: string) => string[]);
  action: kintone.Action;
  disableMobile?: boolean;
}>;

class Launcher {
  private readonly _pluginId: string;

  /**
   * 複数の処理を、各イベントに登録することができます
   * @param pluginId プラグインID
   */
  public constructor(pluginId: string) {
    this._pluginId = pluginId;
  }

  /**
   * 指定された各処理を、各イベント発生時に実行されるよう登録していきます.
   * 特に指定がない場合、モバイル向けにもイベントが登録されます.
   *
   * @param configs イベント実行に必要なプロパティ
   */
  public launch = (configs: Config[]) => {
    for (const config of configs) {
      const {
        enables = () => true,
        events = ['app.record.index.show'],
        action,
        disableMobile = false,
      } = config;

      const desktopEvents = typeof events === 'function' ? events(this._pluginId) : events;

      const mobileEvents = !disableMobile ? desktopEvents.map((type) => 'mobile.' + type) : [];

      // フィールドのチェンジイベントが含まれている場合は
      // 非同期処理を使用することができないため、処理を分岐します
      let handler = null;
      if (desktopEvents.some((event) => event.includes('.change.'))) {
        handler = (event: kintone.Event) => {
          try {
            return enables(event) ? action(event, this._pluginId) : event;
          } catch (error) {
            event.error = `プラグイン「${PLUGIN_NAME}」の処理内でエラーが発生しました。`;
            console.error('エラー', error);
          }
          return event;
        };
      } else {
        handler = async (event: kintone.Event) => {
          try {
            return enables(event) ? await action(event, this._pluginId) : event;
          } catch (error) {
            event.error = `プラグイン「${PLUGIN_NAME}」の処理内でエラーが発生しました。`;
            console.error('エラー', error);
          }
          return event;
        };
      }

      kintone.events.on([...desktopEvents, ...mobileEvents], handler);
    }
  };
}

export default Launcher;
