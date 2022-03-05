export async function getImagesForIds(imageIds) {
  const url = `http://localhost:4214/getImagesForIds`;
  // const url = `https://kitty-kads-nft-image-backend.herokuapp.com/getImagesForIds`;

  const body = { imageIds };
  const res = await fetchJson(url, body);
  const data = await res.json();
  let images = data.images;
  images.sort(
    (image1, image2) =>
      parseInt(image1.id.split(":")[1]) - parseInt(image2.id.split(":")[1])
  );
  return images;
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
