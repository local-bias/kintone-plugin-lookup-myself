import React from 'react';
import { render } from 'react-dom';
import { css } from '@emotion/css';

import { cleanseStorage, restoreStorage } from '@common/plugin';
import { getFieldId } from '@common/cybozu';

import App from './app';

const events: launcher.EventTypes = ['app.record.create.show', 'app.record.edit.show'];

const action: launcher.Action = async (event, pluginId) => {
  const { conditions } = cleanseStorage(restoreStorage(pluginId));

  for (const condition of conditions) {
    if (!condition.target || !condition.related) {
      continue;
    }

    // コピーするフィールドは入力不可
    for (const { to } of condition.copies) {
      if (event.record[to]?.disabled) {
        event.record[to].disabled = true;
      }
    }

    // 対象フィールドは入力可
    event.record[condition.target].disabled = false;

    // 対象文字列フィールドにルックアップっぽいボタンを設置
    const fieldId = getFieldId(condition.target);

    const wrapper =
      document.querySelector<HTMLDivElement>(`.value-${fieldId} > div`) ||
      document.querySelector<HTMLDivElement>(`.value-${fieldId}`);

    if (!wrapper) {
      return event;
    }

    wrapper.classList.remove('disabled-cybozu');

    wrapper.classList.add(css`
      display: flex;
    `);

    const div = document.createElement('div');
    wrapper.append(div);
    div.classList.add(css`
      display: flex;
      position: relative;
    `);

    render(<App {...{ condition }} />, div);
  }

  return event;
};

export default { action, events };
