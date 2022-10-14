import React, { useState, useContext, useCallback } from "react";
import { SCREENS } from "../consts";
import { GameContext } from "../game-context";
import { useGetAllKitties } from "../pact-functions";
import {
  getImagesForIds,
  getKittiesForFilters,
  getIdsForFilters,
} from "../server";

export const PAGE_SIZE = 100;

export function useFetchAllKittiesInit() {
  const { setAllKittiesData } = useContext(GameContext);
  // const [kittiesToShow, setKittiesToShow] = useState(null);
  const getAllKitties = useGetAllKitties();

  // Initialize all kitties data
  useState(() => {
    (async () => {
      const allIds = await getAllKitties();
      const sortedAllIds = sortIds(allIds);
      const allIdsToSave = [];
      for (let i = 0; i < sortedAllIds.length; i++) {
        allIdsToSave.push({ id: sortedAllIds[i] });
      }
      setAllKittiesData(allIdsToSave);
    })();
  });
}

export function useImageSearchAndUpdateHelpers() {
  const {
    allKittiesData,
    setAllKittiesData,
    pagesInfo,
    setPagesInfo,
    searchParams,
    setSearchParams,
  } = useContext(GameContext);

  const fetchNeededImages = async (idsToShow) => {
    const idsNotLoaded = idsToFetch(idsToShow, allKittiesData);
    let newAllData = allKittiesData;
    if (idsNotLoaded.length !== 0) {
      const fetchedData = await getImagesForIds(idsNotLoaded);
      newAllData = getNewAllKittiesData(allKittiesData, fetchedData);
      setAllKittiesData(newAllData);
    }
  };

  const updateSearchParams = (newSearchParams, screen) => {
    // Not ready to search backend
    if (allKittiesData == null) {
      return;
    }
    setSearchParams(newSearchParams);
    const currPageData = pagesInfo[screen];
    if (newSearchParams.id != null) {
      const allResultsIds = [newSearchParams.id];
      const currIds = idsNeededForPage(0, allResultsIds);
      const newPageData = {
        ...currPageData,
        allResultsIds,
        currIds,
      };
      setPagesInfo({ ...pagesInfo, [screen]: newPageData });
      fetchNeededImages(currIds);
      return;
    }
    if (newSearchParams?.filters == null) {
      const allResultsIds = currPageData.defaultIds;
      const currIds = idsNeededForPage(0, allResultsIds);
      const newPageData = {
        ...currPageData,
        allResultsIds,
        currIds,
      };
      setPagesInfo({ ...pagesInfo, [screen]: newPageData });
      fetchNeededImages(currIds, 0);
      return;
    }
    const searchFiltersFromServer = async (filters) => {
      const { defaultIds } = currPageData;
      // If the default ids are a subset of all the ids
      // then add them to the filters
      if (defaultIds.length !== allKittiesData.length) {
        filters = { ...filters, ids: defaultIds };
      }
      const allResultsIds = (await getIdsForFilters(filters)).map(
        (result) => result.id
      );
      const currIds = idsNeededForPage(0, allResultsIds);
      const newPageData = {
        ...currPageData,
        allResultsIds,
        currIds: idsNeededForPage(0, allResultsIds),
      };
      setPagesInfo({ ...pagesInfo, [screen]: newPageData });
      fetchNeededImages(currIds);
    };
    searchFiltersFromServer(newSearchParams);
  };

  const updatePage = (pageData) => {
    // Fetch specific ids to show if not loaded and show all ids
    const { allResultsIds, page } = pageData;
    const idsToShow = idsNeededForPage(page, allResultsIds);
    fetchNeededImages(idsToShow);
  };

  const updatePageNum = (num, screen) => {
    const newPageData = { ...pagesInfo[screen] };
    newPageData.page = num;
    newPageData.currIds = idsNeededForPage(num, newPageData.allResultsIds);
    setPagesInfo({ ...pagesInfo, [screen]: newPageData });
    updatePage(newPageData);
  };

  const handleFirstLoad = async (getDefaultIds, screen) => {
    const currScreenInfo = pagesInfo[screen] ?? {};
    if (currScreenInfo?.currIds == null) {
      const defaultIds = await getDefaultIds();
      const newPageData = {
        ...currScreenInfo,
        defaultIds,
        allResultsIds: defaultIds,
        currIds: defaultIds.slice(0, 100),
        page: 0,
      };
      const newPagesInfo = { ...pagesInfo, [screen]: newPageData };
      setPagesInfo(newPagesInfo);
      updatePage(newPageData);
    }
  };

  const getHeaderText = (screen, defaultText) => {
    let headerText = "";
    const { allResultsIds, defaultIds } = pagesInfo?.[screen] ?? {};
    if (
      Object.keys(searchParams ?? {}).length === 0 &&
      defaultIds?.length != null
    ) {
      headerText = `${defaultIds.length} ${kittiesStr(
        allKittiesData.length
      )} ${defaultText}`;
    } else if (allResultsIds?.length != null) {
      headerText = `${allResultsIds.length} ${kittiesStr(
        allResultsIds.length
      )} found`;
    }
    return headerText;
  };

  const getCurrKittiesAndIsLoading = useCallback(
    (currIds) => {
      if (currIds == null) {
        return {};
      }
      const currKitties = getKittiesToShowData(currIds, allKittiesData);
      let stillLoading = false;
      if (currKitties?.length == null) {
        stillLoading = true;
      } else {
        for (let i = 0; i < currKitties.length ?? 0; i++) {
          if (b64ForKitty(currKitties[i]) == null) {
            stillLoading = true;
            break;
          }
        }
      }
      return { currKitties, stillLoading };
    },
    [allKittiesData]
  );

  return {
    updatePage,
    updateSearchParams,
    updatePageNum,
    handleFirstLoad,
    getHeaderText,
    getCurrKittiesAndIsLoading,
  };
}

export function kittiesStr(amountOfKitties) {
  return `kitt${amountOfKitties > 1 ? "ies" : "y"}`;
}

export function idToIndex(id) {
  return parseInt(id.split(":")[1]);
}

function sortIds(ids) {
  // Copy the ids so we don't mutate the original and sort
  return [...ids].sort((id1, id2) => idToIndex(id1) - idToIndex(id2));
}

function idsNeededForPage(page, currIds) {
  const start = page * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  return currIds.slice(start, end);
}

export function b64ForKitty(kitty) {
  return kitty?.base_64 ?? kitty?.base64;
}

function idsToFetch(idsNeeded, allKittiesData) {
  const toFetch = [];
  for (let i = 0; i < idsNeeded.length; i++) {
    const id = idsNeeded[i];
    const index = idToIndex(id);
    if (b64ForKitty(allKittiesData[index]) == null) {
      toFetch.push(id);
    }
  }
  return toFetch;
}

function getNewAllKittiesData(allKittiesData, fetchedData) {
  const updatedData = [...allKittiesData];
  for (let i = 0; i < fetchedData.length; i++) {
    const id = fetchedData[i].id;
    const index = idToIndex(id);
    updatedData[index] = fetchedData[i];
  }
  return updatedData;
}

export function getPagesCount(kittiesCount) {
  return Math.ceil(kittiesCount / PAGE_SIZE);
}

export function getKittiesToShowData(ids, allKittiesData) {
  return ids.map((id) => allKittiesData[idToIndex(id)]);
}
