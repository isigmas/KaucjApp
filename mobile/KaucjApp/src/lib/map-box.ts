import { Region } from "react-native-maps";

//this function is used to snap the bounding box to a grid, so that we can cache the results and avoid making too many API calls when the user is panning the map. The grid size is defined by CHUNK_SIZE, which is set to 0.05 degrees (approximately 5.5km). This means that the bounding box will be snapped to the nearest 0.05 degree grid, which helps to reduce the number of API calls.

export const getSnappedBBox = (region: Region) => {
  const CHUNK_SIZE = 0.005;
  const PADDING = region.latitudeDelta * 0.1;

  const minLat = region.latitude - region.latitudeDelta / 2 - PADDING;
  const minLon = region.longitude - region.longitudeDelta / 2 - PADDING;
  const maxLat = region.latitude + region.latitudeDelta / 2 + PADDING;
  const maxLon = region.longitude + region.longitudeDelta / 2 + PADDING;

  return {
    swLat: Number((Math.floor(minLat / CHUNK_SIZE) * CHUNK_SIZE).toFixed(3)),
    swLon: Number((Math.floor(minLon / CHUNK_SIZE) * CHUNK_SIZE).toFixed(3)),
    neLat: Number((Math.ceil(maxLat / CHUNK_SIZE) * CHUNK_SIZE).toFixed(3)),
    neLon: Number((Math.ceil(maxLon / CHUNK_SIZE) * CHUNK_SIZE).toFixed(3)),
  };
};
