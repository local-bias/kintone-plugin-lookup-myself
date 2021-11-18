import { getCurrentRecord } from '@common/kintone';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useRecoilCallback, useSetRecoilState } from 'recoil';
import { clearLookup, lookup } from '../action';
import {
  alreadyCacheState,
  alreadyLookupState,
  cacheValidationState,
  dialogPageIndexState,
  dialogVisibleState,
  pluginConditionState,
  searchInputState,
  srcAllRecordsState,
} from '../states';

export const useLookup = () => {
  const { enqueueSnackbar } = useSnackbar();
  const setShown = useSetRecoilState(dialogVisibleState);
  const setInput = useSetRecoilState(searchInputState);
  const setPageIndex = useSetRecoilState(dialogPageIndexState);
  const setCacheValidation = useSetRecoilState(cacheValidationState);
  const setAlreadyLookup = useSetRecoilState(alreadyLookupState);
  const [loading, setLoading] = useState(false);

  const start = useRecoilCallback(({ snapshot }) => async () => {
    setLoading(true);

    try {
      setAlreadyLookup(false);
      setPageIndex(1);
      setCacheValidation(true);

      const condition = (await snapshot.getPromise(pluginConditionState))!;

      const { record } = getCurrentRecord();
      const input = (record[condition.target].value as string) || '';
      setInput(input);

      if (!input) {
        setShown(true);
        return;
      }

      const hasCached = await snapshot.getPromise(alreadyCacheState);
      const cachedRecords = await snapshot.getPromise(srcAllRecordsState);

      await lookup(
        input,
        hasCached,
        cachedRecords,
        enqueueSnackbar,
        setShown,
        setAlreadyLookup,
        condition
      );
    } catch (error) {
      enqueueSnackbar('ルックアップ時にエラーが発生しました', { variant: 'error' });
      throw error;
    } finally {
      setLoading(false);
    }
  });

  const clear = useRecoilCallback(({ snapshot }) => async () => {
    const condition = await snapshot.getPromise(pluginConditionState);
    setAlreadyLookup(false);
    clearLookup(condition!);
    enqueueSnackbar('参照先フィールドをクリアしました', { variant: 'success' });
  });

  return { loading, start, clear };
};
