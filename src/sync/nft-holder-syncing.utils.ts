export const getSyncingServiceToken = (
  symbol,
  chainName,
  network: string,
): string => `${chainName}_${network}_${symbol}_NFT_HOLDERS_SYNCING_SERVICE`;
