let activeVectorStoreId: string | null = null;

export function setActiveVectorStoreId(id: string | null) {
  activeVectorStoreId = id;
}

export function getActiveVectorStoreId() {
  return activeVectorStoreId;
}
