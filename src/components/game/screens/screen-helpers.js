import React, { useState, useContext, useCallback } from "react";
import { SCREENS, SORT_KEYS } from "../consts";
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
  const [kittiesToShow, setKittiesToShow] = useState(null);
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
    if (idsNotLoaded.length) {
      const fetchedData = await getImagesForIds(idsNotLoaded);
      newAllData = getNewAllKittiesData(allKittiesData, fetchedData);
      setAllKittiesData(newAllData);
    }
  };

  const updateSearchParams = (newSearchParams, screen, sortKey, gen) => {
    // Not ready to search backend
    if (allKittiesData.length === 0) {
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
      fetchNeededImages(currIds);
      return;
    }
    const searchFiltersFromServer = async (filters) => {
      const { defaultIds } = currPageData;
      // If the default ids are a subset of all the ids
      // then add them to the filters
      if (defaultIds.length !== allKittiesData.length) {
        filters = { ...filters, ids: defaultIds };
      }
      filters = { ...filters, gen };
      let allResultsIds = (await getIdsForFilters(filters, gen)).map(
        (result) => result.id
      );
      allResultsIds = sortKitties(allResultsIds, allKittiesData, sortKey);
      updatePagesInfo(defaultIds, allResultsIds, screen);
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

  const updatePagesInfo = (defaultIds, allResultsIds, screen) => {
    const currScreenInfo = pagesInfo[screen] ?? {};
    const newPageData = {
      ...currScreenInfo,
      defaultIds,
      allResultsIds: allResultsIds,
      currIds: allResultsIds.slice(0, 100),
      page: 0,
    };
    const newPagesInfo = { ...pagesInfo, [screen]: newPageData };
    setPagesInfo(newPagesInfo);
    updatePage(newPageData);
  };

  const handleFirstLoad = async (
    getDefaultIds,
    screen,
    sortKey = SORT_KEYS.LOWEST_ID
  ) => {
    const currScreenInfo = pagesInfo[screen] ?? {};
    if (currScreenInfo?.currIds == null) {
      let defaultIds = await getDefaultIds();
      defaultIds = sortKitties(defaultIds, allKittiesData, sortKey);
      updatePagesInfo(defaultIds, defaultIds, screen);
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
    fetchNeededImages,
    updatePage,
    updateSearchParams,
    updatePageNum,
    handleFirstLoad,
    getHeaderText,
    getCurrKittiesAndIsLoading,
    updatePagesInfo,
  };
}

export function sortKitties(defaultIds, allKittiesData, sortKey) {
  if (sortKey == null) {
    return defaultIds;
  }
  const sortedIds = [...defaultIds].sort((a, b) => {
    const aIndex = idToIndex(a);
    const bIndex = idToIndex(b);
    const aPrice = allKittiesData[aIndex]?.price ?? 0;
    const bPrice = allKittiesData[bIndex]?.price ?? 0;
    if (sortKey === SORT_KEYS.LOWEST_PRICE) {
      return aPrice - bPrice;
    } else if (sortKey === SORT_KEYS.HIGHEST_PRICE) {
      return bPrice - aPrice;
    } else if (sortKey === SORT_KEYS.LOWEST_ID) {
      return aIndex - bIndex;
    } else if (sortKey === SORT_KEYS.HIGHEST_ID) {
      return bIndex - aIndex;
    }
    return aIndex - bIndex;
  });
  return sortedIds;
}

export function kittiesStr(amountOfKitties) {
  return `kitt${amountOfKitties > 1 ? "ies" : "y"}`;
}

export function idToIndex(id) {
  // Gen 0s
  if (id.includes(":")) {
    return parseInt(id.split(":")[1]);
  }
  // Gen 0s take up spots 0-> 9999
  // Gen 1s start from id 1 -> 5,000
  // If not a Gen 0, then get Gen 1 index
  return 9999 + parseInt(id);
}

function sortIds(ids) {
  // Copy the ids so we don't mutate the original and sort
  return [...ids].sort((id1, id2) => idToIndex(id1) - idToIndex(id2));
}

export function idsForGen(ids, gen) {
  if (ids == null) {
    return null;
  }
  return ids.filter((id) => (gen === 0 ? id.includes(":") : !id.includes(":")));
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
    if (b64ForKitty(allKittiesData?.[index]) == null) {
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
