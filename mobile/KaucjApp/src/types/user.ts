export interface User {
  user_id: number;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  addresses: UserAddress[];
}

export interface UserAddress {
  addressLabel?: string;
  address: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}
