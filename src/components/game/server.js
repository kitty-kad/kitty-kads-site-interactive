// const url = `http://localhost:4214/`;
const url = `https://kitty-kads-nft-image-backend.herokuapp.com/`;
const imagesSuffix = "getImagesForIds";
const searchSuffix = "search";
const getIdsSuffix = "getAllIdsForFilters";

export async function getImagesForIds(imageIds) {
  const body = { imageIds };
  const res = await fetchJson(url + imagesSuffix, body);
  const data = await res.json();
  let images = data.images;
  sortKittiesInPlace(images);
  return images;
}

export async function getKittiesForFilters(filters) {
  const body = filters;
  const res = await fetchJson(url + searchSuffix, body);
  const data = await res.json();
  let kitties = data.kitties ?? [];

  return { kitties, pages: data.pages, count: data.count };
}

export async function getIdsForFilters(filters) {
  const body = filters;
  const res = await fetchJson(url + getIdsSuffix, body);
  const { results } = await res.json();
  sortKittiesInPlace(results, filters.gen);
  return results;
}

function sortKittiesInPlace(kitties, gen = 0) {
  kitties.sort((kitty1, kitty2) => {
    if (kitty1.id === "1" || kitty2.id === "1") {
      console.log(kitty2.id, kitty1.id);
    }
    if (gen === 1) {
      return parseInt(kitty1.id) - parseInt(kitty2.id);
    }
    return (
      parseInt(kitty1.id.split(":")[1]) - parseInt(kitty2.id.split(":")[1])
    );
  });
}

async function fetchJson(url, body) {
  const params = {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  };
  return await fetch(url, params);
}
