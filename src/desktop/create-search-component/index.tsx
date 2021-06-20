import React from 'react';
import { render } from 'react-dom';
import { css } from '@emotion/css';

import { restoreStorage } from '@common/plugin';
import { getFieldId } from '@common/cybozu';

import App from './app';

const events: kintone.EventType[] = ['app.record.create.show', 'app.record.edit.show'];

const action: kintone.Action = async (event, pluginId) => {
  const { conditions } = restoreStorage(pluginId);

  for (const condition of conditions) {
    if (!condition.target || !condition.related) {
      continue;
    }

    // コピーするフィールドは入力不可
    for (const { to } of condition.copies) {
      if (to) {
        event.record[to].disabled = true;
      }
    }

    // 対象文字列フィールドにルックアップっぽいボタンを設置
    const fieldId = getFieldId(condition.target);

    const wrapper = document.querySelector(`.value-${fieldId} > div`);
    if (!wrapper) {
      return event;
    }

    wrapper.classList.add(css`
      display: flex;
    `);

    const div = document.createElement('div');
    wrapper?.append(div);
    div.classList.add(css`
      display: flex;
    `);

    render(<App {...{ condition }} />, div);
  }

  return event;
};

export default { action, events };
