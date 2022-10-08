// const url = `http://localhost:4214/`;
const url = `https://kitty-kads-nft-image-backend.herokuapp.com/`;
const imagesSuffix = "getImagesForIds";
const searchSuffix = "search";

export async function getImagesForIds(imageIds) {
  const body = { imageIds };
  const res = await fetchJson(url + imagesSuffix, body);
  const data = await res.json();
  let images = data.images;
  images.sort(
    (image1, image2) =>
      parseInt(image1.id.split(":")[1]) - parseInt(image2.id.split(":")[1])
  );
  return images;
}

export async function getKittiesForFilters(filters) {
  const body = filters;
  const res = await fetchJson(url + searchSuffix, body);
  const data = await res.json();
  let kitties = data.kitties ?? [];
  kitties.sort(
    (kitty1, kitty2) =>
      parseInt(kitty1.id.split(":")[1]) - parseInt(kitty2.id.split(":")[1])
  );
  return { kitties, pages: data.pages, count: data.count };
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
