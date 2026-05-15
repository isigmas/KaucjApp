export interface User {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
  collectedBottleCount: number;
  collectedCanCount: number;
  returnedBottleCount: number;
  returnedCanCount: number;
  returnedTotalCount: number;
  collectedTotalCount: number;
  addresses: UserAddress[];
}

export interface UserAddress {
  addressLabel?: string;
  address: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}
